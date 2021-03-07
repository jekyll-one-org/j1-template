/*
 # -----------------------------------------------------------------------------
 #  ~/info.js
 #  Provides help for all toplevel commands (package scripts))
 #
 #  Product/Info:
 #  https://jekyll.one
 #  http://getbootstrap.com/
 #
 #  Copyright (C) 2021 Juergen Adams
 #
 #  J1 Template is licensed under MIT License.
 #  See: https://github.com/jekyll-one-org/J1 Template/blob/master/LICENSE
 # -----------------------------------------------------------------------------
*/
'use strict';

// -----------------------------------------------------------------------------
// modules|libraries
// -----------------------------------------------------------------------------
const cliUsage = require('command-line-usage');


// -----------------------------------------------------------------------------
// const|var
// -----------------------------------------------------------------------------
var myArgs = process.argv.slice(2);
var usage;


const top_level_commands = [
  {
    header: 'J1',
    content: 'J1 Template is using a NodeJS package files (package.js) to control the project. The package file implements a .. '
  },
  {
    header: 'Toplevel commands',
    content: 'Toplevel commands are ..'
  },
  {
    header: 'Command List',
    content: [
      { name: 'j1', summary: 'Run this help page.' },
      { name: 'app', summary: 'Run the buildin starter web as a Web Application.' },
      { name: 'audit', summary: '' },
      { name: 'build', summary: 'Runs the builder chain to create the buildin starter web.' },
      { name: 'bump', summary: '' },
      { name: 'bundle', summary: '' },
      { name: 'gem', summary: 'Create a Ruby Gem from source.' },
      { name: 'lint', summary: '' },
      { name: 'rebuild', summary: '' },
      { name: 'setup', summary: '' },
      { name: 'reset', summary: '' },
      { name: 'site', summary: '' },
      { name: 'web', summary: 'Run the buildin starter web.' },
      { name: 'ver', summary: 'Display the current project version.' },
    ]
  }
]

const app = [
  {
    header: 'J1',
    content: 'Toplevel commands'
  },
  {
    header: 'app',
    content: 'J1 Template supports plain static webs ...'
  },
  {
    header: 'Examples',
    content: [
      { name: 'yarn app', summary: 'Run the buildin starter web as a Web Application.' },
    ]
  }
]

const audit = [
  {
    header: 'J1',
    content: 'Toplevel commands'
  },
  {
    header: 'audit',
    content: 'bla.'
  },
  {
    header: 'Examples',
    content: [
      { name: 'yarn audit', summary: 'bla.' },
    ]
  }
]

const build = [
  {
    header: 'J1',
    content: 'Toplevel commands'
  },
  {
    header: 'build',
    content: 'Runs the builder chain to create the buildin starter web.'
  },
  {
    header: 'Examples',
    content: [
      { name: 'yarn build', summary: 'bla.' },
    ]
  }
]

const bump = [
  {
    header: 'J1',
    content: 'Toplevel commands'
  },
  {
    header: 'bump',
    content: 'bla.'
  },
  {
    header: 'Examples',
    content: [
      { name: 'yarn bump', summary: 'bla.' },
    ]
  }
]

const bundle = [
  {
    header: 'J1',
    content: 'Toplevel commands'
  },
  {
    header: 'bundle',
    content: 'bla.'
  },
  {
    header: 'Examples',
    content: [
      { name: 'yarn bundle', summary: 'bla.' },
    ]
  }
]

const gem = [
  {
    header: 'J1',
    content: 'Toplevel commands'
  },
  {
    header: 'gem',
    content: 'Create or Install the J1 Template Rubie'
  },
  {
    header: 'Examples',
    content: [
      { name: 'yarn gem create', summary: 'Creates the J1 Template Rubie from the Gem source folder.' },
      { name: 'yarn gem install-local', summary: 'Installs the J1 Template Rubie from the (local) Gem source folder.' },
    ]
  }
]

const lint = [
  {
    header: 'J1',
    content: 'Toplevel commands'
  },
  {
    header: 'lint',
    content: 'bla.'
  },
  {
    header: 'Examples',
    content: [
      { name: 'yarn lint css', summary: 'bla.' },
      { name: 'yarn lint js', summary: 'bla.' },
      { name: 'yarn lint adapter', summary: 'bla.' },
    ]
  }
]

const rebuild = [
  {
    header: 'J1',
    content: 'Toplevel commands'
  },
  {
    header: 'rebuild',
    content: 'Rebuild a template component from the scratch.'
  },
  {
    header: 'Examples',
    content: [
      { name: 'yarn rebuild js', summary: 'Rebuilds all JS resources used by the buildin starter web.' },
      { name: 'yarn rebuild css', summary: 'Rebuilds all CSS resources used by the buildin starter web.' },
      { name: 'yarn rebuild site', summary: 'Rebuilds the buildin starter web.' },
    ]
  }
]

const setup = [
  {
    header: 'J1',
    content: 'Toplevel commands'
  },
  {
    header: 'setup',
    content: 'bla.'
  },
  {
    header: 'Examples',
    content: [
      { name: 'yarn setup', summary: 'bla.' },
    ]
  }
]

const reset = [
  {
    header: 'J1',
    content: 'Toplevel commands'
  },
  {
    header: 'reset',
    content: 'bla.'
  },
  {
    header: 'Examples',
    content: [
      { name: 'yarn reset', summary: 'bla.' },
    ]
  }
]

const site = [
  {
    header: 'J1',
    content: 'Toplevel commands'
  },
  {
    header: 'site',
    content: 'bla.'
  },
  {
    header: 'Examples',
    content: [
      { name: 'yarn site', summary: 'bla.' },
    ]
  }
]

const web = [
  {
    header: 'J1',
    content: 'Toplevel commands'
  },
  {
    header: 'web',
    content: 'bla.'
  },
  {
    header: 'Examples',
    content: [
      { name: 'yarn web', summary: 'bla.' },
    ]
  }
]

const ver = [
  {
    header: 'J1',
    content: 'Toplevel commands'
  },
  {
    header: 'ver',
    content: 'bla.'
  },
  {
    header: 'Examples',
    content: [
      { name: 'yarn ver', summary: 'bla.' },
    ]
  }
]

// -----------------------------------------------------------------------------
// switch to run specific help (default: summary)
// -----------------------------------------------------------------------------
switch (myArgs[0]) {
  case 'app':
    usage = cliUsage(app);
    break;
  case 'audit':
    usage = cliUsage(audit);
    break;
  case 'build':
    usage = cliUsage(build);
    break;
  case 'bump':
    usage = cliUsage(bump);
    break;
  case 'bundle':
    usage = cliUsage(bundle);
    break;
  case 'gem':
    usage = cliUsage(gem);
    break;
  case 'lint':
    usage = cliUsage(gem);
    break;
  case 'rebuild':
    usage = cliUsage(rebuild);
    break;
  case 'setup':
    usage = cliUsage(setup);
    break;
  case 'reset':
    usage = cliUsage(reset);
    break;
  case 'site':
    usage = cliUsage(site);
    break;
  case 'web':
    usage = cliUsage(web);
    break;
  case 'ver':
    usage = cliUsage(ver);
    break;
  default:
    usage = cliUsage(top_level_commands);
}

// -----------------------------------------------------------------------------
// run help
// -----------------------------------------------------------------------------
console.clear()
console.info(usage);
