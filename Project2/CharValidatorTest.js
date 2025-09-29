const { Builder, By, until } = require('selenium-webdriver');
const assert = require('node:assert');

const data = [
    { 'Data': 9999999, 'expected Output': 'Valid Value' },
    { 'Data': '#$%^#', 'expected Output': 'Invalid value' },
    { 'Data': 'hendd**', 'expected Output': 'valid value' },
    { 'Data': 'AHYEDIO', 'expected Output': 'valid value' },
    { 'Data': 'jdtegdj', 'expected Output': 'valid value' },
    { 'Data': 3705490, 'expected Output': 'valid value' },
    { 'Data': 'ASHFbnj', 'expected Output': 'valid value' },
    { 'Data': 'hye76BG', 'expected Output': 'valid value' },
    { 'Data': '23BgbG*', 'expected Output': 'valid value' },
    { 'Data': 'gyr$%8N', 'expected Output': 'invalid value' },
    { 'Data': 'bhtr50', 'expected Output': 'invalid value' },
    { 'Data': 'huy bh', 'expected Output': 'invalid value' }
];

async function runDataDrivenTests() {
  let driver = await new Builder().forBrowser('chrome').build();

  try {
    await driver.get('https://testpages.eviltester.com/styled/apps/7charval/simple7charvalidation.html');

    for (const entry of data) {
      const inputData = entry.Data.toString();
      const expectedOutput = entry['expected Output'].toLowerCase();

      // Log which data point is being tested
      console.log(`\n--- Testing with data: "${inputData}" ---`);

      // 1. Enter data into the input field
      await driver.findElement(By.name('characters')).sendKeys(inputData);
      
      // 2. Click the 'Check Input' button
      await driver.findElement(By.name('validate')).click();

      // 3. Get the value of the validation message field (output field)
      const messageElement = await driver.findElement(By.name('validation_message'));
      const actualOutput = await messageElement.getAttribute('value');

      // 4. Verify the actual output against the expected output
     try {
        assert.strictEqual(actualOutput.toLowerCase(), expectedOutput);
        console.log(`Test Passed: Expected "${expectedOutput}", and got "${actualOutput}".`);
        } catch (error) {
            console.error(`Test Failed for "${inputData}": Expected "${expectedOutput}", but got "${actualOutput}".`);
            }

      // Clear the input field to prepare for the next test
      await driver.findElement(By.name('characters')).clear();
    }

  } catch (error) {
    console.error('An error occurred during the test:', error);
  } finally {
    // Close the browser after all tests are finished
    await driver.quit();
  }
}

runDataDrivenTests();