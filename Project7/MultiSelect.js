const { By, Browser, Builder, Select, until } = require('selenium-webdriver'); 
const assert = require('assert');

async function runTest() {
    let driver = await new Builder().forBrowser('chrome').build();

    try {
        // open the webpage
        await driver.get('https://yekoshy.github.io/Dropdown/select_demo.html');

        const selectOption = async (optionValue) => {
            // Locates the individual option element based on its value
            const locator = By.css(`select[id='state-select'] > option[value='${optionValue}']`);
            return await driver.findElement(locator);
        };

        // Manual clicks to select options
        await selectOption('Texas').then(el => el.click());      // First selected
        await selectOption('Florida').then(el => el.click());    // Second selected
        await selectOption('Washington').then(el => el.click()); 

        
        // ********* FIX IS HERE *********
        //  Locate the parent <select> element
        const selectWebElement = await driver.findElement(By.id('state-select'));

        // Instantiate the Select object, defining the variable 'select'
        const select = new Select(selectWebElement);
        // *******************************


        // Trigger the page function to display the first selection in the UI
        const firstSelectedBtn = await driver.findElement(By.id('first-selected-btn'));
        await driver.wait(until.elementIsVisible(firstSelectedBtn), 5000);
        await firstSelectedBtn.click();

        // Use the built-in method getFirstSelectedOption()
        const firstSelectedOption = await select.getFirstSelectedOption(); 
        // Get the text from the returned WebElement
        const expect = await firstSelectedOption.getText();

        const strongElement = await driver.findElement(By.css("#multi-select-display strong"));

        // Wait until the expected text appears in the strong tag
        //await driver.wait(until.elementTextIs(strongElement), 5000); 
        const Output = await strongElement.getText();
  
        // The text from the UI should match the text retrieved directly from Selenium
        assert.strictEqual(Output, expect, `Text Mismatch: Expected "${expect}", but got "${Output}".`);
        console.log(`✅ Test Passed: Expected "${expect}", and got "${Output}".`);


        await driver.sleep(1000);

    } catch (error) {
        // Catch assertion failures or WebDriver errors
        console.error(`❌ Test Failed; ${error.message}`);
    } finally {
        // Ensures the browser closes regardless of test outcome
        await driver.quit();
    }
}

runTest();