const { WebDriver,until,Builder, By, Key } = require("selenium-webdriver");

require("chromedriver"); 
const assert = require('node:assert');

// --- Define Constants ---
const TARGET_URL = 'https://yekoshy.github.io/RadioBtn-n-Checkbox/';

const RADIO_BUTTON_IDS = [
  'male-single',
  'female-single'
];
const OUTPUT_AREA_ID = 'single-radio-output';
const EXPECTED_TEXT = [
    "Radio button 'Male' is checked", 
    "Radio button 'Female' is checked"
];

async function runRadioTest() {
    let driver = await new Builder().forBrowser('chrome').build();

    try {
        console.log(`Browser opened at: ${TARGET_URL}`);
        await driver.get(TARGET_URL);

        for (let i = 0; i < 2; i++) {
        // Action: Locate and click the Male radio button
        console.log(`Locating and clicking the '${RADIO_BUTTON_IDS[i]}' radio button...`);
        let RadioButton = await driver.findElement(By.id(RADIO_BUTTON_IDS[i]));
        await RadioButton.click();

        let actualText = await driver.findElement(By.id(OUTPUT_AREA_ID)).getText();

        assert.equal(actualText, EXPECTED_TEXT[i], `Text mismatch! `);
        console.log(`TEST PASSED: '${RADIO_BUTTON_IDS[i]}' Verification successful!`);
     }
        


    } catch (e) {
        console.error(`TEST FAILED with an error`);
    } finally {
        // 5. Teardown: Close the browser
        await driver.quit();
        console.log('Browser closed.');
    }
}

runRadioTest();
