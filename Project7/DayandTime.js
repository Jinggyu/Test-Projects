const {By, Browser, Builder, Select} = require('selenium-webdriver')
const assert = require('assert');

async function runTest() {
 let driver = await new Builder().forBrowser('chrome').build();



 try {

// open the webpage
await driver.get('https://yekoshy.github.io/Dropdown/select_demo.html');

const selectElement = await driver.findElement(By.id('day-select'));
const select = new Select(selectElement);
await select.selectByVisibleText('Monday');
  
const strongElement = await driver.findElement(By.css('#selected-day-display strong'));
const Output = await strongElement.getText(); 


//VERIFY the text output
assert.strictEqual(Output, 'Monday', `Text Mismatch: Expected "Monday", but got "${Output}".`);
       console.log(` Test Passed: Expected "Monday", and got "${Output}".`);

await driver.sleep(1000);

 }catch (error) {
        // Catch assertion failures or WebDriver errors
        console.error(`Test Failed; ${error.message}`);
    } finally {
        // Ensures the browser closes regardless of test outcome
        await driver.quit();
    }

}


runTest();