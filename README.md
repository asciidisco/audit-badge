# audit-badge

Generates a badge with the number of vulnerable packages in your `package.json`

## Installing

For local usage:

```bash
npm i audit-badge --save-dev
```

For global usage:

```bash
npm i audit-badge -g
```

One time remote execution:

```bash
npx audit-badge
```

## Usage

```bash
$ audit-badge -h

  Usage: audit-badge [options]

  Options:

    -v, --version            output the version number
    -c, --config <location>  Set path for package.json to be introspected, uses cwd as default
    -p, --production         Scan for production vulnerabilities only
    -q, --quiet              No reporting output
    -o, --output <file>      Pathname of the output file, will write to stdout if not given
    -h, --help               output usage information
```

## Running the tests

You can run the test with:

```bash
npm test
```

### And coding style tests

This project adheres to the rules of [StandardJS](https://standardjs.com/)

```bash
npm run lint
```

## Built With

* [Dropwizard](http://www.dropwizard.io/1.0.2/docs/) - The web framework used
* [Maven](https://maven.apache.org/) - Dependency Management
* [ROME](https://rometools.github.io/rome/) - Used to generate RSS Feeds

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on the process for submitting pull requests to us and [code-of-conduct.md](code-of.conduct.md) for details on our code of conduct when contributing.

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/asciidisco/audit-badge/tags).

## Authors

* **Sebastian Golasch** - *Initial work* - [asciidisco](https://github.com/asciidisco)

See also the list of [contributors](https://github.com/asciidisco/audit-badge/contributors) who participated in this project.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE) file for details
