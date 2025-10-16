const { By, Browser, Builder, Select, until } = require('selenium-webdriver');
const assert = require('assert');

// A reusable function to convert a single WebElement or an array of WebElements
// into a single, comma-separated text string.
async function resolveOutputToText(output) {
    if (Array.isArray(output)) {
        // Efficiently handles array of WebElements concurrently
        const textArray = await Promise.all(output.map(el => el.getText()));
        return textArray.join(', ');
    } else {
        // Handles single WebElement
        return await output.getText();
    }
}

async function runTest() {
    let driver = await new Builder().forBrowser('chrome').build();
    try {
        console.log("Starting test run...");
        // open the webpage
        await driver.get('https://yekoshy.github.io/Dropdown/select_demo.html');
        console.log("Webpage opened successfully.");

        // Helper function to click a specific option element
        const selectOption = async (optionValue) => {
            const locator = By.css(`select[id='state-select'] > option[value='${optionValue}']`);
            return await driver.findElement(locator);
        };

        // Manual clicks to select options
        console.log("Selecting multiple options: Texas, Florida, Washington...");
        await selectOption('Texas').then(el => el.click());
        await selectOption('Florida').then(el => el.click());
        await selectOption('Washington').then(el => el.click()); 

        
        // Locate the parent <select> element and instantiate the Select object
        const selectWebElement = await driver.findElement(By.id('state-select'));
        const select = new Select(selectWebElement);

        const testCases = [
            // Case 1: getFirstSelectedOption() returns a single WebElement
            { name: 'Get First Selected Option', Btn: 'first-selected-btn', expectOutPromise: select.getFirstSelectedOption()},
            // Case 2: getAllSelectedOptions() returns an Array of WebElements
            { name: 'Get All Selected Options', Btn: 'get-all-selected-btn', expectOutPromise: select.getAllSelectedOptions()}
        ];

     for (let i = 0; i < testCases.length; i++) {
        const testCase = testCases[i];
        
        console.log(`\n--- Running Test: ${testCase.name} ---`);

        // 1. Click the button to update the UI output
        const selectedBtn = await driver.findElement(By.id(testCase.Btn));
        await driver.wait(until.elementIsVisible(selectedBtn), 5000);
        await selectedBtn.click();
        console.log(`Clicked button: ${testCase.Btn}`);


        // 2. Resolve the expected output from the Selenium Select method (This resolves the Promise)
        const expectOutput = await testCase.expectOutPromise;
        
        // *** REFACTORED: Use dedicated helper function to handle single/array WebElements ***
        const expectedText = await resolveOutputToText(expectOutput);
        console.log(`Selenium Expected Result: ${expectedText}`);
        // **********************************************************************************

        // 3. Get the actual output from the webpage UI
        const strongElement = await driver.findElement(By.css('#multi-select-display strong'));
        const actualOutput = await strongElement.getText();
        console.log(`Actual UI Output: ${actualOutput}`);
  
        // 4. Assert the result
        assert.strictEqual(actualOutput, expectedText, `Text Mismatch: Expected "${expectedText}", but got "${actualOutput}".`);
        console.log(`✅ Test Passed: Expected "${expectedText}", and got "${actualOutput}".`);

        await driver.sleep(1000);
          }

    } catch (error) {
        // Catch assertion failures or WebDriver errors
        console.error(`\n❌ Test Failed: ${error.message}`);
    } finally {
        // Ensures the browser closes regardless of test outcome
        await driver.quit();
        console.log("\nTest finished and browser closed.");
    }
}

runTest();