import test from 'node:test';
import assert from 'node:assert/strict';
import { buildJsonTree } from './jsonTree.mjs';

test('buildJsonTree creates nested object and array nodes', () => {
  const tree = buildJsonTree({
    user: {
      name: 'Ada',
      roles: ['dev', 'ops'],
    },
  });

  assert.equal(tree.type, 'object');
  assert.equal(tree.children.length, 1);
  assert.equal(tree.children[0].key, 'user');
  assert.equal(tree.children[0].node.type, 'object');
  assert.equal(tree.children[0].node.children[0].key, 'name');
  assert.equal(tree.children[0].node.children[1].key, 'roles');
  assert.equal(tree.children[0].node.children[1].node.type, 'array');
  assert.equal(tree.children[0].node.children[1].node.children.length, 2);
});
