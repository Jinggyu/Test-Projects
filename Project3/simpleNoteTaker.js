const { WebDriver,until,Builder, By, Key } = require("selenium-webdriver");
const { expect } = require('chai'); // Chai assertion library


// --- Configuration ---
const url = 'https://testpages.eviltester.com/styled/apps/notes/simplenotes.html';
let driver;

// to structure and track multiple independent test cases. 
// to ensures that each test is executed safely, and its success or failure is clearly reported in the console.
async function runTest(testName, testFunction) {
     console.log(`Starting Test: ${testName}`);
    try {
        await testFunction();
        console.log(`Test PASSED: ${testName}`);
    } catch (error) {
        console.error(`Test FAILED: ${testName}`);
        console.error('Error:', error.message);
    }
}

// to initialize the testing environment and place the browser in the starting state required for the tests.
async function setup() {
    console.log('SETUP: Launching browser and navigating');
    driver = await new Builder().forBrowser('chrome').build();
    await driver.get(url);
}

// for clean-up and to ensure system resources are properly released after all tests have finished.
async function teardown() {
    if (driver) {
        console.log('TEARDOWN: Closing browser');
        await driver.quit();
    }
}

// Test Case 1: Add 5 Notes and Verify Creation
// Expect: The new notes appears in the list.
async function testAddFiveNotes() {
    const totalNotes = 5;
    const baseTitle = 'Auto Note ';
    const baseDetails = 'Content for note number ';
    // Array to store the expected titles for later verification
    const expectedTitles = []; 

    for (let i = 1; i <= totalNotes; i++) {
        const testTitle = baseTitle + i;
        const testDetails = baseDetails + i;
        expectedTitles.push(testTitle); // Store the title

        // 1. ACT: Fill in inputs
        await driver.findElement(By.id('note-title-input')).sendKeys(testTitle);
        await driver.findElement(By.id('note-details-input')).sendKeys(testDetails);

        // 2. ACT: Click the Add button
        await driver.findElement(By.id('add-note')).click();

        // 3. CHAI ASSERTION: Check that the status message is correctly displayed everytime added notes.
        const statusElement = await driver.findElement(By.id('note-status-details'));
        const statusText = await statusElement.getText();
        expect(statusText).to.equal('Added Note', `Added Status message failure. Expected: 'Added Note'. `);
    }

    // 4. ASSERT (Chai): Check the final count of notes
    const notes = await driver.findElements(By.css('#list-of-notes > .note-in-list'));
    expect(notes.length).to.equal(totalNotes, `Expected exactly ${totalNotes} notes to be visible.`);


    // 5. ASSERT (Chai): Verify the title of each note
    for (let i = 0; i < totalNotes; i++) {
        const noteElement = notes[i];
        
        // Locate the title element within the current note
        const titleElement = await noteElement.findElement(By.css('.title-note-in-list'));
        const actualTitle = await titleElement.getText();
        const expectedTitle = expectedTitles[i];
        // Verify the retrieved title matches the stored expected title
        expect(actualTitle).to.equal(
            expectedTitle, 
            `Note ${i + 1} content verification failed. Expected: "${expectedTitle}", Actual: "${actualTitle}"`
        );
    }

}




//Test Case 2: Delete First Two Notes by click button "X" and Verify Remaining Count 
//Expect: Only clear the specific notes.  
async function testDeleteFirstTwoNotes() {
    const notesToDelete = 2;

    for (let i = 0; i < notesToDelete; i++) {
        // 1. Re-query all notes (crucial, as the array indices shift after deletion)
        const notes = await driver.findElements(By.css('#list-of-notes > .note-in-list'));
        const noteToProcess = notes[0]; // Always target the first element (index 0)

        // 2. LOCATE and CLICK the Delete button within the first note
        const deleteButton = await noteToProcess.findElement(By.css('.delete-note-in-list'));
        const dataKeyText = await deleteButton.getAttribute('data-key');
        await deleteButton.click(); 
        // RETRIEVE the value of the 'data-key' attribute from that element for later use.
      

        // 3. HANDLE THE BROWSER CONFIRMATION POP-UP
        const alert = await driver.switchTo().alert();
        await alert.accept(); 

        // 4. ASSERTION: Wait for the note to disappear (become stale)
        await driver.wait(until.stalenessOf(noteToProcess), 5000); 

       // 5. Get the status message
       const statusElement = await driver.findElement(By.id('note-status-details'));
       const statusText = await statusElement.getText();
    
       //console.log("actual status message is" + statusText);
    
       // 6. CHAI ASSERTION: Verify the status message text
       expect(statusText).to.equal(`Deleted Note: ${dataKeyText}`, `delete note message failure. Expected:${statusText}. `);
    }

    // 7. FINAL ASSERTION: Check the count after 2 deletions (5 - 2 = 3)
    const remainingNotes = await driver.findElements(By.css('#list-of-notes > .note-in-list'));  
    const expectedFinalCount = 3;

    expect(remainingNotes.length).to.equal(
        expectedFinalCount, 
        `Expected ${expectedFinalCount} notes remaining, but found ${remainingNotes.length}.`
    );

}

// Test Case 3: Clear all notes by click the "Clear all" button
// Expect: Notes list should be empty after clearing.    
async function testClearAllNotes() {
    // 1. ACT: Locate the Clear All button using its ID and click it.
    await driver.findElement(By.id('clear-notes')).click();

    // The Clear All button also triggers a confirmation dialog, just like deleting single notes.
    
    // 2. HANDLE THE BROWSER CONFIRMATION POP-UP
    const alert = await driver.switchTo().alert();
    await alert.accept(); // Click 'OK' to confirm clearing all notes.

    // 3. ASSERTION: Check that the notes list is now empty.
    // Re-query the notes container. If nothing is found, findElements returns an empty array.
    const remainingNotes = await driver.findElements(By.css('#list-of-notes > .note-in-list'));

    // 4. CHAI ASSERTION: Check that the notes count is zero.
    expect(remainingNotes.length).to.equal(0, 'Expected the notes list to be empty after clicking "Clear All".');

    // 5. ASSERT: Check that the status message is displayed
    const statusElement = await driver.findElement(By.id('note-status-details'));
    const statusText = await statusElement.getText();
    
    // 6. CHAI ASSERTION: Verify the status message text
    expect(statusText).to.equal('Deleted All Notes', `delete note message failure. Expected: 'Deleted All Notes'. `);
    
}


// Test Case 4: Error test
// Expect: error message is displayed and no notes are added.

// A reusable function to handle the common assertion logic for failure cases
async function assertFailureState(testName, expectedNoteCount) {
    // 1. ASSERT: Check that the error message is displayed
    const statusElement = await driver.findElement(By.id('note-status-details'));
    const statusText = await statusElement.getText();

    // CHAI ASSERTION: Verify the error message text
    expect(statusText).to.equal('Error Adding Note', `[${testName}] Status message failure. Expected: 'Error Adding Note'. Actual: ${statusText}`);

    // 2. ASSERT: Check that NO new note element was added
    const notes = await driver.findElements(By.css('#list-of-notes > .note-in-list'));
    
    // CHAI ASSERTION: Verify the note count is unchanged
    expect(notes.length).to.equal(expectedNoteCount, `[${testName}] Note count failure. Expected ${expectedNoteCount} notes, but found ${notes.length}.`);
}


// --- Comprehensive Boundary Testing ---
async function testBoundaryCases() {
    // Start with a clean slate
    await driver.get(url); 
    
    // Initial count should be 0 before any boundary tests
    let currentNoteCount = 0; 

    // --------------------------------------------------------
    // //Test Case 4.1: Add Nothing (Title empty, Details empty)
    // --------------------------------------------------------
    await runTest('Case 4.1: Add Nothing', async () => {
        // 1. ACT: Ensure fields are clear and click 'Add Note'
        await driver.findElement(By.id('note-title-input')).clear();
        await driver.findElement(By.id('note-details-input')).clear();
        await driver.findElement(By.id('add-note')).click();

        // 2. ASSERT: Check for error status and unchanged note count (0)
        await assertFailureState('Case 4.1: Add Nothing', currentNoteCount);
    });


    // --------------------------------------------------------
    // //Test Case 4.2: Add Only Title (Details empty)
    // --------------------------------------------------------
    await runTest('Case 4.2: Add Only Title', async () => {
        const testTitle = 'Title Only Test';
        
        // 1. ACT: Fill Title, clear Details, click Add
        await driver.findElement(By.id('note-title-input')).sendKeys(testTitle);
        await driver.findElement(By.id('note-details-input')).clear(); 
        await driver.findElement(By.id('add-note')).click();

        // 2. ASSERT: Check for error status and unchanged note count (0)
        await assertFailureState('Case 4.2: Add Only Title', currentNoteCount);
    });


    // --------------------------------------------------------
    // //Test Case 4.3: Add Only Details (Title empty)
    // --------------------------------------------------------
    await runTest('Case 4.3: Add Only Details', async () => {
        const testDetails = 'Details Only Content';

        // 1. ACT: Clear Title, fill Details, click Add
        await driver.findElement(By.id('note-title-input')).clear(); 
        await driver.findElement(By.id('note-details-input')).sendKeys(testDetails);
        await driver.findElement(By.id('add-note')).click();

        // 2. ASSERT: Check for error status and unchanged note count (0)
        await assertFailureState('Case 4.3: Add Only Details', currentNoteCount);
    });
}

// --- Main Execution Block ---
async function main() {
    try {
        await setup();

        console.log('\n======================================================');
        console.log('         STARTING POSITIVE/CRUD TEST SUITE');
        console.log('======================================================');

        // Execute new tests sequentially
        await runTest('Test Case 1: Add 5 Notes and Verify Creation', testAddFiveNotes);
        //await runTest('Running All Boundary Cases', testBoundaryCases); 
        await runTest('Test Case 2: Delete First Two Notes by click button "X" and Verify Remaining Count (3)', testDeleteFirstTwoNotes);
        await runTest('Test Case 3: Clear all notes by click the "Clear all" button', testClearAllNotes);

        console.log('\n======================================================');
        console.log('         STARTING NEGATIVE/BOUNDARY TEST SUITE');
        console.log('======================================================');
        await runTest ('Test Case 4: Error test', testBoundaryCases); 
        

    } catch (error) {
        console.error('A CRITICAL error occurred during setup or execution:', error);
    } finally {
        await teardown();
    }
}

main();