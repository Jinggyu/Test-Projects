
// Test case link: https://docs.google.com/spreadsheets/d/1BuddlqOxKKrgG5qWTQe1Vk9ansoZXkDZzikejKRc_64/edit?usp=sharing

const { Builder, By, until } = require('selenium-webdriver');
const assert = require('assert');

// Define the assumed URL for the web application under test
const TARGET_URL = 'https://yekoshy.github.io/RadioBtn-n-Checkbox/';

// Mapping the visible labels to their expected input IDs on the target website
// IDs now include the 'check-' prefix.
const CHECKBOX_IDS = {
    'Home': 'check-home',
    'Desktop': 'check-desktop',
    'Documents': 'check-documents',
    'Downloads': 'check-downloads',
    'Notes': 'check-notes',
    'Commands': 'check-commands',
    'WorkSpace': 'check-workspace',
    'Office': 'check-office',
    'Word File.doc': 'check-wordfile',
    'Excel File.doc': 'check-excelfile'
};

// All known checkbox names for verification
const ALL_CHECKBOXES = Object.keys(CHECKBOX_IDS);


/**
 * Helper function to locate and click an element using only XPath or ID/CSS.
 * @param {WebDriver} driver - The Selenium WebDriver instance.
 * @param {string} labelText - The exact visible text of the label (e.g., 'Documents').
 * @param {string} elementType - 'checkbox' or 'arrow'.
 */
async function findAndClickElement(driver, labelText, elementType) {
    const id = CHECKBOX_IDS[labelText];
    if (!id) {
        throw new Error(`Label text '${labelText}' not found in CHECKBOX_IDS map.`);
    }

    let locator;

    if (elementType === 'checkbox') {
        // Locate the checkbox input by its static ID (CSS Selector: #id)
        locator = By.id(id);
    } else if (elementType === 'arrow') {
        // Locate the toggle icon (arrow) using XPath relative to the visible label text.
        // Uses the generic 'toggle-arrow' class provided by the user.
        locator = By.xpath(`//span[text()='${labelText}']/preceding-sibling::span[contains(@class, 'toggle-arrow')]`);
    } else {
        throw new Error(`Invalid element type: ${elementType}`);
    }
    
    const element = await driver.findElement(locator);

    try {
        await driver.wait(until.elementIsVisible(element), 3000, `Element for ${labelText} not visible.`);
        await driver.wait(until.elementIsEnabled(element), 3000, `Element for ${labelText} not enabled.`);
        
        await element.click();
        console.log(`Successfully clicked the ${elementType} for: ${labelText}`);
    } catch (error) {
        console.error(`Could not click the ${elementType} for ${labelText}. Error: ${error.message}`);
        throw error; 
    }
}

/**
 * Utility function to expand all currently collapsed nodes.
 * Used as a pre-requisite for all selection tests.
 */
async function expandAll(driver) {
    const COLLAPSED_ARROW_XPATH = "//span[@class='toggle-arrow collapsed']";
    let arrowsFound = true;
    while (arrowsFound) {
        await driver.wait(until.elementLocated(By.xpath(COLLAPSED_ARROW_XPATH)), 500) // Short wait is sufficient inside loop
            .catch(() => { arrowsFound = false; });
        
        if (!arrowsFound) break;

        const collapsedArrows = await driver.findElements(By.xpath(COLLAPSED_ARROW_XPATH));
        if (collapsedArrows.length === 0) {
            arrowsFound = false;
            break; 
        }
        await collapsedArrows[0].click();
        await driver.sleep(300); // Wait briefly for the DOM to update
    }
    console.log("--- Tree fully expanded. ---");
}

/**
 * Helper function to check if a checkbox is checked.
 * @param {WebDriver} driver - The Selenium WebDriver instance.
 * @param {string} labelText - The visible text of the checkbox (e.g., 'Notes').
 * @returns {Promise<boolean>}
 */
async function isCheckboxChecked(driver, labelText) {
    const id = CHECKBOX_IDS[labelText];
    const locator = By.id(id);
    const element = await driver.findElement(locator);
    // This function remains the same, as the locator uses the updated ID map.
    return await element.isSelected();
}

/**
 * Helper function to verify the content of the selection status message.
 * @param {WebDriver} driver - The Selenium WebDriver instance.
 * @param {string} expectedNames - Comma-separated or space-separated expected folder names.
 */
async function verifyConfirmationMessage(driver, expectedNames) {
    const resultElement = await driver.findElement(By.id('checkbox-output'));
    const actualText = await resultElement.getText();
    //const expectedPrefix = "You have selected: ";
    //const fullExpectedText = expectedPrefix + expectedNames;
    const fullExpectedText = expectedNames;

    assert.strictEqual(actualText.trim(), fullExpectedText.trim(), 
        `Message verification failed. Expected: '${fullExpectedText.trim()}' | Actual: '${actualText.trim()}'`);
    console.log(`Message Verified: '${actualText.trim()}'`);
}

/**
 * Helper function to reset the state of all checkboxes by clicking 'Home' until it's unchecked.
 * @param {WebDriver} driver - The Selenium WebDriver instance.
 */
async function resetAllCheckboxes(driver) {
    // 1. Expand tree to ensure 'Home' is targetable
    await expandAll(driver); 
    
    // 2. Click Home twice if necessary to guarantee all boxes are unchecked
    const homeIsChecked = await isCheckboxChecked(driver, 'Home');
    if (!homeIsChecked) {
        // If not checked, check it first (to reset potential partial states)
        await findAndClickElement(driver, 'Home', 'checkbox');
        //await driver.sleep(2); 
    }
    // Now Home should be checked (or was already checked). Click to uncheck all.
    await findAndClickElement(driver, 'Home', 'checkbox');
    await driver.sleep(1000); // Longer wait for full cascade uncheck

    // Final check for empty message
    await verifyConfirmationMessage(driver, "");
    console.log("--- Checkbox state reset completed. ---");
}


// --- TEST SUITE FUNCTIONS ---

/**
 * TC_Selection_3_1 to 3_6: Verify Level 3 single selection isolation.
 */
async function testCase_Level3_SingleSelection(driver) {
    console.log(`\n--- Running TC_Selection_3_1 to 3_6 (Level 3 Single Selection) ---`);
    
    const targets = [
        { name: 'Notes', expectedMessage: 'Notes' },
        { name: 'Commands', expectedMessage: 'Commands' },
        { name: 'WorkSpace', expectedMessage: 'WorkSpace' },
        { name: 'Office', expectedMessage: 'Office' },
        { name: 'Word File.doc', expectedMessage: 'Word File.doc' },
        { name: 'Excel File.doc', expectedMessage: 'Excel File.doc' }
    ];

    for (const target of targets) {
        await resetAllCheckboxes(driver);

        // Click the Level 3 checkbox
        console.log(`-> Testing single click: ${target.name}`);
        await findAndClickElement(driver, target.name, 'checkbox');
        await driver.sleep(500);

        // Verify the message
        await verifyConfirmationMessage(driver, target.expectedMessage);

        // Verify isolation (Only the target box is checked)
        for (const boxName of ALL_CHECKBOXES) {
            const isChecked = await isCheckboxChecked(driver, boxName);
            const shouldBeChecked = boxName === target.name;
            assert.strictEqual(isChecked, shouldBeChecked, 
                `Isolation Failure: '${boxName}' checked state is incorrect.`);
        }
        console.log(`Isolation Verified: Only '${target.name}' is checked.`);
    }

    console.log(`--- TC_Selection_3_1 to 3_6 Completed ---\n`);
}

/**
 * TC_Selection_3_7 to 3_9: Verify Level 3 multiple selection and cascade up to Level 2.
 */
async function testCase_Level3_MultipleSelection(driver) {
    console.log(`\n--- Running TC_Selection_3_7 to 3_9 (Multi-Level 3 & Cascade Up) ---`);

    const tests = [
        { 
            tc: 'TC_Selection_3_7', 
            parent: 'Desktop', 
            children: ['Notes', 'Commands'], 
            expectedMessage: 'Desktop Notes Commands'
        },
        { 
            tc: 'TC_Selection_3_8', 
            parent: 'Documents', 
            children: ['WorkSpace', 'Office'], 
            expectedMessage: 'Documents WorkSpace Office'
        },
        { 
            tc: 'TC_Selection_3_9', 
            parent: 'Downloads', 
            children: ['Word File.doc', 'Excel File.doc'], 
            expectedMessage: 'Downloads Word File.doc Excel File.doc'
        }
    ];

    for (const test of tests) {
        await resetAllCheckboxes(driver);
        
        console.log(`-> Running ${test.tc}: Parent '${test.parent}' with children: ${test.children.join(', ')}`);

        // Click both children (Level 3)
        for (const child of test.children) {
            await findAndClickElement(driver, child, 'checkbox');
            await driver.sleep(200);
        }
        await driver.sleep(500); // Wait for cascade up

        // Verify message
        await verifyConfirmationMessage(driver, test.expectedMessage);

        // Verify parent (Level 2) and children (Level 3) are checked
        const parentChecked = await isCheckboxChecked(driver, test.parent);
        assert.strictEqual(parentChecked, true, `Cascade Up Failure: Parent '${test.parent}' must be checked.`);
        console.log(`Parent '${test.parent}' checked.`);

        for (const child of test.children) {
            const childChecked = await isCheckboxChecked(driver, child);
            assert.strictEqual(childChecked, true, `Child '${child}' must be checked.`);
        }
        console.log(`All children checked.`);
    }

    console.log(`--- TC_Selection_3_7 to 3_9 Completed ---\n`);
}

/**
 * TC_Selection_2_1 to 2_3: Verify Level 2 single selection and cascade down.
 */
async function testCase_Level2_SingleSelection(driver) {
    console.log(`\n--- Running TC_Selection_2_1 to 2_3 (Level 2 Cascade Down) ---`);
    
    const tests = [
        { 
            tc: 'TC_Selection_2_1', 
            parent: 'Desktop', 
            children: ['Notes', 'Commands'], 
            expectedMessage: 'Desktop Notes Commands'
        },
        { 
            tc: 'TC_Selection_2_2', 
            parent: 'Documents', 
            children: ['WorkSpace', 'Office'], 
            expectedMessage: 'Documents WorkSpace Office'
        },
        { 
            tc: 'TC_Selection_2_3', 
            parent: 'Downloads', 
            children: ['Word File.doc', 'Excel File.doc'], 
            expectedMessage: 'Downloads Word File.doc Excel File.doc'
        }
    ];

    for (const test of tests) {
        await resetAllCheckboxes(driver);
        
        console.log(`-> Running ${test.tc}: Parent '${test.parent}' Cascade Down`);

        // Click the Level 2 parent
        await findAndClickElement(driver, test.parent, 'checkbox');
        await driver.sleep(1000); // Wait for cascade down

        // Verify message
        await verifyConfirmationMessage(driver, test.expectedMessage);

        // Verify parent (Level 2) and all children (Level 3) are checked
        const parentChecked = await isCheckboxChecked(driver, test.parent);
        assert.strictEqual(parentChecked, true, `Parent '${test.parent}' must be checked.`);

        for (const child of test.children) {
            const childChecked = await isCheckboxChecked(driver, child);
            assert.strictEqual(childChecked, true, `Child '${child}' must be checked.`);
        }
        console.log(`All selections verified.`);
    }

    console.log(`--- TC_Selection_2_1 to 2_3 Completed ---\n`);
}

/**
 * TC_Selection_1_1 and 2_4: Verify full tree selection (Level 1 click and Level 2 multiple clicks).
 */
async function testCase_FullTree_Selection(driver) {
    const ALL_MESSAGE = 'Home Desktop Notes Commands Documents WorkSpace Office Downloads Word File.doc Excel File.doc';
    const ALL_FOLDERS = ['Home', 'Desktop', 'Documents', 'Downloads', 'Notes', 'Commands', 'WorkSpace', 'Office', 'Word File.doc', 'Excel File.doc'];
    
    // --- TC_Selection_1_1: Home Checkbox ---
    console.log(`\n--- Running TC_Selection_1_1 (Home Full Cascade) ---`);
    await resetAllCheckboxes(driver);
    
    console.log(`-> Clicking 'Home' Checkbox...`);
    await findAndClickElement(driver, 'Home', 'checkbox');
    await driver.sleep(1000); // Wait for full cascade

    await verifyConfirmationMessage(driver, ALL_MESSAGE);

    // Verify all boxes are checked
    for (const boxName of ALL_FOLDERS) {
        const isChecked = await isCheckboxChecked(driver, boxName);
        assert.strictEqual(isChecked, true, `Full Cascade Failure: '${boxName}' must be checked.`);
    }
    console.log(`All 10 checkboxes verified as checked.`);

    // --- TC_Selection_2_4: Level 2 Multiple Checkboxes ---
    console.log(`\n--- Running TC_Selection_2_4 (Multi-Level 2 Cascade Up) ---`);
    await resetAllCheckboxes(driver);
    
    const level2Targets = ['Desktop', 'Documents', 'Downloads'];
    console.log(`-> Clicking Level 2 Checkboxes: ${level2Targets.join(', ')}`);

    for (const target of level2Targets) {
        await findAndClickElement(driver, target, 'checkbox');
        await driver.sleep(300);
    }
    await driver.sleep(500); // Wait for final cascade up to Home

    await verifyConfirmationMessage(driver, ALL_MESSAGE);
    
    // Verify all boxes are checked (same as TC_Selection_1_1)
    for (const boxName of ALL_FOLDERS) {
        const isChecked = await isCheckboxChecked(driver, boxName);
        assert.strictEqual(isChecked, true, `Full Cascade Failure: '${boxName}' must be checked.`);
    }
    console.log(`All 10 checkboxes verified as checked.`);

    console.log(`--- TC_Selection_1_1 and 2_4 Completed ---\n`);
}


// --- Main Execution Function ---
async function runTests() {
    let driver = await new Builder().forBrowser('chrome').build();
    
    // Initial locator to ensure the page has loaded the component
    const initialArrowLocator = By.xpath(`//span[@class='toggle-arrow collapsed']`);

    try {
        console.log(`Navigating to: ${TARGET_URL}`);
        await driver.get(TARGET_URL);

        await driver.manage().window().maximize();
        
        // Scroll down to the correct section (Multilevel Checkbox Test)
        console.log('Scrolling to Checkbox Test section...');
        await driver.executeScript("const element = document.querySelector('h2'); if (element) element.scrollIntoView({ behavior: 'smooth', block: 'center' }); else window.scrollBy(0, 500);");
        
        // Wait for the first collapsed arrow to be present
        console.log('Waiting for the initial folder structure to load...');
        await driver.wait(until.elementLocated(initialArrowLocator), 15000, "Initial collapsed folder not found on page. Wait timed out.");
        await driver.sleep(1000); 

        // 1. Run Level 3 Single Selection tests (requires expanded tree)
        await expandAll(driver); 
        await testCase_Level3_SingleSelection(driver);

        // 2. Run Level 3 Multiple Selection tests (requires expanded tree)
        await expandAll(driver); // Ensure tree is fully reset
        await testCase_Level3_MultipleSelection(driver);

        // 3. Run Level 2 Single Selection tests (requires expanded tree)
        await expandAll(driver); // Ensure tree is fully reset
        await testCase_Level2_SingleSelection(driver);

        // 4. Run Full Tree Selection tests (requires expanded tree)
        await expandAll(driver); // Ensure tree is fully reset
        await testCase_FullTree_Selection(driver);

        console.log("\n*** ALL SELECTION TEST CASES COMPLETED SUCCESSFULLY ***");

    } catch (error) {
        console.error('An unrecoverable error occurred during the test execution:', error);
    } finally {
        await driver.quit();
        console.log('Driver session closed.');
    }
}

// Execute the test suite
runTests();
