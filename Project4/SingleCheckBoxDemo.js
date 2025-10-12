const { WebDriver,until,Builder, By, Key } = require("selenium-webdriver");

require("chromedriver"); 
const assert = require('node:assert');

// --- Define Constants ---
const TARGET_URL = 'https://yekoshy.github.io/RadioBtn-n-Checkbox/';

const CheckBox_IDS = [
  'check-primary',
  'check-default-checked',
  'check-default-disabled'
];
const OUTPUT_AREA_ID = 'single-checkbox-message';
const EXPECTED_TEXT = "Success - Check box is checked" ;


async function ChecboxTest() {
    let driver = await new Builder().forBrowser('chrome').build();

    try {
        console.log(`Browser opened at: ${TARGET_URL}`);
        await driver.get(TARGET_URL);

        //for (let i = 0; i < 2; i++) {
        console.log(`Locating and clicking the '${CheckBox_IDS[0]}' `);
        let CheckBox = await driver.findElement(By.id(CheckBox_IDS[0]));
        await CheckBox.click();

        let actualText = await driver.findElement(By.id(OUTPUT_AREA_ID)).getText();

        assert.equal(actualText, EXPECTED_TEXT, `Text mismatch! `);
        console.log(`TEST PASSED: '${CheckBox_IDS[0]}' Verification successful!`);
     //}
        


    } catch (e) {
        console.error(`TEST FAILED with an error`);
    } finally {
        // 5. Teardown: Close the browser
        await driver.quit();
        console.log('Browser closed.');
    }
}

ChecboxTest();