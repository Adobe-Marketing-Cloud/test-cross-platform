const chalk = require('chalk');
const fs = require('fs-extra');
const path = require('path');
const crossPlatformTester = require('..');
const pkg = require('../package.json');
const localize = require("./localize");

const failedExit = () => { process.exit(1) };
const log = message => { process.stderr.write(message + '\n') };
const formatPlatform = ([os, browser, version]) => `Running test in ${browser} v. (${version}) in ${os}`;

function parse(path) {
    try {
        return fs.readJsonSync(path);

    } catch (err) {
        log(chalk.red(`No configurations found at: ${path}`));
        failedExit();
    }
}

function getPackageOpts() {
  try {
      const pkgPath = path.resolve(process.cwd(), './package.json');
      return fs.readJsonSync(pkgPath).testCrossPlatform;

  } catch (err) {}
}

function logTestResults(tests) {
    log("\n");
    for (let test of tests) {
        const platform = formatPlatform(test.platform);
        const passed = Boolean(test.result && test.result.passed);
        const icon = passed ? chalk.green('\u2713') : chalk.red('\u2717');

        log(`${icon} ${platform}\n`);
        log(localize("VISIT_TEST_URL", test.url));
    }
}

module.exports = function(argv) {

  if (argv.help) {
      return fs.createReadStream(path.join(__dirname, './help.txt')).pipe(process.stderr);
  }

  const configOpts = (argv.config ? parse(argv.config) : getPackageOpts()) || {};

  var configs = Object.assign({}, argv);

  if (argv.username || process.env.SAUCE_USERNAME) {
      configs.username = argv.username || process.env.SAUCE_USERNAME;
  }
  if (argv.key || process.env.SAUCE_ACCESS_KEY) {
      configs.key = argv.key || process.env.SAUCE_ACCESS_KEY;
  }

  if (configs.platforms) {
      try {
          configs.platforms = JSON.parse(configs.platforms);
          
      } catch(err) {
          log(chalk.red('Option platforms "' + configs.platforms + '" should be a valid JSON'));
          failedExit();
      }
  }

  return crossPlatformTester(Object.assign({}, configOpts, configs))
      .on("message", (message) => {
          log(chalk.magenta(message));
      })
      .on("update", (test) => {
          log(chalk.cyan(`${formatPlatform(test.platform)}: ${test.status}`));
      })
      .on("success", (tests) => {
          logTestResults(tests);
          log(chalk.green(localize("TEST_PASSED")));
      })
      .on("failure", () => {
          log(chalk.red('Oops, there were test failures!'));
          failedExit();
      })
      .on("error", (err) => {
          log(chalk.red(err.stack));
          failedExit();
      });
};
