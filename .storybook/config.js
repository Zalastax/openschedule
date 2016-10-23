import { configure } from '@kadira/storybook';

const req = require.context('components', true, /.stories.tsx?$/)

function loadStories() {
  req.keys().forEach((filename) => req(filename))
}

configure(loadStories, module);
