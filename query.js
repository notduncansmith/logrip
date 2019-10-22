const { exec, spawn } = require('child_process')
const { readdir, stat } = require('fs').promises;
const chrono = require('chrono-node')
const Tail = require('tail').Tail
const _ = require('highland')
const { streamWrite } = require('@rauschma/stringio')

module.exports = query

async function query(cmd, argv, onResult) {
    const debug = (...args) => argv.debug && console.log(...args)
    debug('ARGV:', argv)
    if (argv._.length) { console.log('USAGE:'); cmd.showHelp(); return }

    const [start, end] = [parseDate(argv.start), parseDate(argv.end)]
    debug('START/END:', `${start}/${end}`)

    const [firstFile, ...restFiles] = selectedFiles = await selectFiles(start, end)
    debug('SELECTED:', selectedFiles)
    if (!selectedFiles.length) { debug('#NOFILES'); return }

    const pipeline = buildPipeline(argv, selectedFiles, start, end)
    debug('PIPELINE:', pipeline)

    if (argv.tail) { debug('## TAIL ##') } else { debug('## QUERY ##') }

    await new Promise((resolve, reject) => {
        const subprocess = exec(pipeline, {shell: true})
        subprocess.stdout.on('data', onResult)
        subprocess
            .on('exit', () => resolve(true))
            .on('error', (err) => { console.error('FATAL:', err); reject(err) })
    });

    async function selectFiles(start, end) {
        const files = await readdir(argv.path)
        const filesWithTimes = await Promise.all(files.map(async f => {
            const path = argv.path + '/' + f
            const {mtimeMs} = await stat(path)
            return {f: path, modified: Math.round(mtimeMs / 1000)}
        }))
        debug('FOUND:', filesWithTimes.sort((a, b) => a.modified - b.modified))

        return filesWithTimes
        .filter(({f, modified}) => modified >= start && modified <= end)
        .sort((a, b) => a.modified - b.modified)
        .map(({f}) => f)
    }
}

function buildPipeline(argv, files, start, end) {
    const pipeline = []

    if (argv.tail) {
        pipeline.push(`tail -n +0 -F -q ${files.join(' ')}`)
        pipeline.push(`grep -h --line-buffered -e '{'`)
    } else {
        pipeline.push(`grep -h --line-buffered -e '{' ${files.join(' ')}`)
    }

    if (argv.m) { pipeline.push(`grep --line-buffered -e '${argv.m}'`)}
    if (argv.v) { pipeline.push(`grep --line-buffered -ve '${argv.v}'`)}

    const jqDatePredicate = `$date > ${start} and $date < ${end}`
    const selectPredicate = argv.select ? `and ${argv.select}` : ''
    const field = argv.f[0] === '.' ? argv.f : '.' + argv.f
    const jqPipeline = [
        // Remove milliseconds from timestamp
        `(${field} | gsub("\\\\.[0-9][0-9][0-9]";"") | fromdateiso8601) as $date`,
        `select(${jqDatePredicate + selectPredicate})`,
    ]

    if (argv.jq) { jqPipeline.push(argv.jq) }

    pipeline.push(`./node_modules/node-jq/bin/jq ${argv.raw?'-R':''} --unbuffered -r -M --compact-output '${jqPipeline.join(' | ')}'`)
    return pipeline.join(' | ')
}

function parseDate(str) { return Math.round(chrono.parse(str)[0].start.date().valueOf() / 1000) }