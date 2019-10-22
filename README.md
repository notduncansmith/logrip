# logrip

Search JSONL files ("logs") by time and content

```sh
yarn global add logrip
```

## About

Logrip is a tool designed to facilitate rapid root-cause analysis, debugging, and monitoring. It searches or tails structured log files for time-and-content-relevant log lines, and can transform these log lines before outputting them.

All heavy lifting is done by `tail`, `grep`, and `jq` - we just parse user input and pipe these tools together. Eventually, it would be great to do all of this in one program (and probably not in JavaScript).

## Usage

```sh
logrip <start> [end]

Positionals:
  start  Datetime to start from. Can be natural language (e.g. "yesterday at
         5pm") or an ISO-8601 string         [string] [default: "5 minutes ago"]
  end    Datetime to end at. Can be natural language (e.g. "yesterday at 5pm")
         or an ISO-8601 string                         [string] [default: "now"]

Options:
  --version            Show version number                             [boolean]
  --path, -p           The path to the log files         [string] [default: "."]
  --field, -f          The `jq` field expression for log timestamps
                                                [string] [default: ".timestamp"]
  --tail, -t           Tail the latest matched log file and continue reporting
                       query results                  [boolean] [default: false]
  --limit, -l          Limit the number of lines that should be returned by the
                       query (does not limit continuous output from --tail)
                                                        [number] [default: 1000]
  --match, -m          A regex pattern to filter incoming lines         [string]
  --inverse-match, -v  A regex pattern to inverse-filter incoming lines [string]
  --select, -s         A boolean `jq` expression to filter incoming lines
                                                                        [string]
  --jq, -q             A `jq` expression to transform incoming lines    [string]
  --raw, -r            A flag indicating whether `jq` should use `--raw-input`
                                                                       [boolean]
  --debug              Print debugging information during run          [boolean]
  --help               Show help                                       [boolean]


## Examples:

❯ ./logrip yesterday -f date -p ./logs
{"date":"2019-10-22T08:58:13.123Z","foo":"bar"}
{"date":"2019-10-22T08:58:14.123Z","foo":"baz"}
{"date":"2019-10-22T08:58:15.123Z","foo":"qux"}
{"date":"2019-10-22T08:58:15.123Z","foo":"qqux"}
{"date":"2019-10-22T08:58:15.123Z","foo":"qqqux"}

❯ ./logrip yesterday -f date -m qqq -p ./logs
{"date":"2019-10-22T08:58:15.123Z","foo":"qqqux"}

❯ ./logrip yesterday -f date -v q -p ./logs
{"date":"2019-10-22T08:58:13.123Z","foo":"bar"}
{"date":"2019-10-22T08:58:14.123Z","foo":"baz"}
```

## License

[The MIT License](https://opensource.org/licenses/MIT):

Copyright 2019 Duncan Smith

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.