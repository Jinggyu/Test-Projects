// Test case link: https://docs.google.com/spreadsheets/d/1xAwU4QyGhVhD6U4DlsZsxvc1C1JJJGp6o3kXn2StTJM/edit?gid=0#gid=0

const { Builder, By, until } = require('selenium-webdriver');
const assert = require('assert');

const Side1Input = [5, 3, 5, 1, 4, "%"]; // '%' is now a string
const Side2Input = [5, 4, 5, 2, "e", 3]; // 'e' is now a string
const Side3Input = [5,5,8,3,6,4];
const expectedvalue = ["Equilateral", "Scalene", "Isosceles", "Not a triangle", "invalid data","invalid data"];
const tolerance = 0.001; 

async function runTest() {

 let driver = await new Builder().forBrowser('chrome').build();

 try {
// open the webpage
await driver.get('https://testpages.eviltester.com/styled/apps/triangle/triangle001.html');

// start the loop

for (let i = 0; i<6; i++ ){

    console.log (`run TEST Case MT-A00${i+1}`);
    const side1 = Side1Input[i];
    const side2 = Side2Input[i];
    const side3 = Side3Input[i];
    const expected = expectedvalue[i];

try {

// Find the input fields and reset the values
        await driver.findElement(By.css('input#side1')).clear();   
        await driver.findElement(By.css('input#side2')).clear();        
        await driver.findElement(By.css('input#side3')).clear();

//enter the numbers
       await driver.findElement(By.css('input#side1')).sendKeys(side1);
       await driver.findElement(By.css('input#side2')).sendKeys(side2);
       await driver.findElement(By.css('input#side3')).sendKeys(side3);

// Find the identify triangle button and click it
       const identifyButton = await driver.findElement(By.css('button#identify-triangle-action')); 
       await identifyButton.click();

// Locate the triangle Type element and get its text
       
       const triangleType = await driver.findElement(By.id('triangle-type'));
       const triangleTypeText = await triangleType.getText();

//VERIFY the text output
       const expectedOutput= expected;
       assert.strictEqual(triangleTypeText, expectedOutput, `Text Mismatch: Expected "${expectedOutput}", but got "${triangleTypeText}".`);
       console.log(`Text Test Passed: Expected "${expectedOutput}", and got "${triangleTypeText}".`);

// Retrieve the Internal Drawing Data
       const drawData = await driver.executeScript(function() {
            // Retrieve the data from the internal application state
            if (typeof currentTriangle !== 'undefined' && currentTriangle.drawn) {
                return {
                    A: currentTriangle.drawn.A,
                    B: currentTriangle.drawn.B,
                    C: currentTriangle.drawn.C
                };
            }
            return null;
        });
     if (!drawData) {
            console.error("COORDINATE TEST FAILED: Internal 'currentTriangle.drawn' object was not found.");
            return;
        }

        // 5. Verification of Drawing COORDINATES
        let coordCheckPassed = true;
        
        // Check A and B (Base verification: A=[0,0], B=[0, side1 =3])
        if (drawData.A[0] !== 0 || drawData.A[1] !== 0 || drawData.B[0] !== 0 || drawData.B[1] !== parseFloat(side1)) {
            console.error(`  - A/B check failed: A=${drawData.A}, B=${drawData.B} (Expected A=[0,0], B=[0,${side1}])`);
            coordCheckPassed = false;
        }

        // Check C (Height verification: C=[4.0, 3.0])
        const actual_C_X = drawData.C[0];
        const actual_C_Y = drawData.C[1];

        // Calculate Expected Coordinates
        const AB = parseFloat(side1); 
        const BC = parseFloat(side2); 
        const AC = parseFloat(side3); 

        // Formula: (AB^2 + AC^2 - BC^2) / (2 * AB)
        const C_Y_numerator = (AB * AB) + (AC * AC) - (BC * BC);
        const expected_C_Y = C_Y_numerator / (2 * AB);

        // Calculate C_X (Application's C[0] - Height, using Pythagorean Theorem)
        // Formula: sqrt(AC^2 - C_Y^2)
        const C_X_squared = (AC * AC) - (expected_C_Y * expected_C_Y);
    
        // Handle potential floating-point errors near zero for C_X_squared
        const expected_C_X = (C_X_squared >= 0) ? Math.sqrt(C_X_squared) : 0;

        if (Math.abs(actual_C_X - expected_C_X) > tolerance || Math.abs(actual_C_Y - expected_C_Y) > tolerance) {
            console.error(`  COORDINATE check failed: C=[${actual_C_X.toFixed(4)}, ${actual_C_Y.toFixed(4)}]`);
            console.error(`    (Expected C=[${expected_C_X.toFixed(4)}, ${expected_C_Y.toFixed(4)}])`);
            coordCheckPassed = false;
        }
        
        if (coordCheckPassed) {
            console.log(`IMAGE TEST PASSED: All three points verified.`);
            console.log(`Points: A[0, 0], B[0, ${side1 }], C[${actual_C_X.toFixed(4)}, ${actual_C_Y.toFixed(4)}]`);
        } else {
            console.error(` IMAGE TEST FAILED: One or more points did not match expected values.`);
        }
        
        console.log('----------------------------------------------------');

}catch (error) {
                // This catches errors for the current single loop iteration (i)
                console.error(`FAILED Test Case MT-A00${i+1}: ${error.message}`);
                console.log('----------------------------------------------------');
            }
   }
}catch (error) {
        // Catch assertion failures or WebDriver errors
        console.error(`Test Failed`);
    } finally {
        // Ensures the browser closes regardless of test outcome
        await driver.quit();
    }
}


runTest();