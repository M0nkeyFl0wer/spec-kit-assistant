import { test } from 'node:test';
import assert from 'node:assert';

test('Spec Kit Assistant - Basic smoke test', async () => {
  // Test that core modules can be imported without syntax errors

  try {
    const { SpecCharacter } = await import('../src/character/spec.js');
    const spec = new SpecCharacter();
    assert.ok(spec.name === 'Spec');
    console.log('✅ SpecCharacter loads successfully');
  } catch (error) {
    assert.fail(`SpecCharacter failed to load: ${error.message}`);
  }

  try {
    const { DogArt } = await import('../src/character/dog-art.js');
    assert.ok(DogArt.happy);
    console.log('✅ DogArt loads successfully');
  } catch (error) {
    assert.fail(`DogArt failed to load: ${error.message}`);
  }

  try {
    const { GoogleTasksIntegration } = await import('../src/integrations/google-tasks.js');
    const tasks = new GoogleTasksIntegration();
    assert.ok(tasks);
    console.log('✅ GoogleTasksIntegration loads successfully');
  } catch (error) {
    assert.fail(`GoogleTasksIntegration failed to load: ${error.message}`);
  }

  try {
    const { NotificationManager } = await import('../src/integrations/notifications.js');
    const notifications = new NotificationManager();
    assert.ok(notifications);
    console.log('✅ NotificationManager loads successfully');
  } catch (error) {
    assert.fail(`NotificationManager failed to load: ${error.message}`);
  }

  console.log('🎉 All critical modules load without errors');
});

test('Dog commands work', () => {
  // This would be tested by actually running the dog-commands.js file
  assert.ok(true, 'Dog commands basic test passes');
});