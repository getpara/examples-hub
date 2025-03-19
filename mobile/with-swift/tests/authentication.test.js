const { remote } = require('webdriverio');

// WebdriverIO configuration
const wdioConfig = {
    capabilities: {
        platformName: 'iOS',
        'appium:automationName': 'XCUITest',
        'appium:deviceName': 'iPhone 16 Pro',
        'appium:platformVersion': '18.3',
        'appium:bundleId': 'com.usecapsule.example.swift',
        'appium:newCommandTimeout': 240,
        'appium:wdaLocalPort': 8100
    },
    hostname: 'localhost',
    port: 4723,
    path: '/',
    logLevel: 'info'
};

// Test constants
const TEST_EMAIL_DOMAIN = "test.usecapsule.com";
const VERIFICATION_CODE = "123456";

// Helper functions
async function setupDriver() {
    const driver = await remote(wdioConfig);
    await driver.execute("mobile: enrollBiometric", { enrolled: true });
    return driver;
}

async function waitForElement(driver, selector, timeout = 30000, errorMessage) {
    const element = await driver.$(selector);
    if (!(await element.waitForExist({ timeout }))) {
        throw new Error(errorMessage);
    }
    return element;
}

async function handleFaceID(driver) {
    await driver.pause(5000);
    
    // Custom tap at coordinates x:200, y:790
    await driver.performActions([
        {
            type: 'pointer',
            id: 'finger1',
            parameters: { pointerType: 'touch' },
            actions: [
                { type: 'pointerMove', duration: 0, x: 200, y: 790 },
                { type: 'pointerDown', button: 0 },
                { type: 'pause', duration: 100 },
                { type: 'pointerUp', button: 0 }
            ]
        }
    ]);
    await driver.releaseActions();
    
    await driver.pause(5000);
    await driver.execute("mobile: sendBiometricMatch", { type: "faceId", match: true });
    await driver.pause(8000);
}

async function verifyWalletsView(driver) {
    const walletsTitle = await waitForElement(
        driver,
        '~Wallets',
        15000,
        "WalletsView did not appear within 10 seconds"
    );
    return walletsTitle;
}

describe('Authentication Tests', () => {
    let driver;

    beforeEach(async () => {
        driver = await setupDriver();
    });

    afterEach(async () => {
        if (driver) {
            await driver.deleteSession();
        }
    });

    test('should complete email authentication flow', async () => {
        // 1. Tap the Email Authentication button
        const emailButton = await waitForElement(
            driver,
            '~emailAuthButton',
            5000,
            "emailAuthButton did not appear within 5 seconds"
        );
        await emailButton.click();

        // 2. Generate and enter unique email
        const timestamp = Math.floor(Date.now() / 1000);
        const uniqueEmail = `teste2e+${timestamp.toString(16).padStart(10, '0')}@${TEST_EMAIL_DOMAIN}`;

        const emailField = await waitForElement(
            driver,
            '~emailInputField',
            5000,
            "emailInputField did not appear"
        );
        await emailField.click();
        await emailField.setValue(uniqueEmail);

        // 3. Continue and enter verification code
        const continueButton = await waitForElement(
            driver,
            '~continueButton',
            5000,
            "continueButton did not appear"
        );
        await continueButton.click();

        const codeInput = await waitForElement(
            driver,
            '~verificationCodeField',
            5000,
            "Verification code input field did not appear"
        );
        await codeInput.click();
        await codeInput.setValue(VERIFICATION_CODE);

        // 4. Verify and handle Face ID
        const verifyButton = await waitForElement(
            driver,
            '~verifyButton',
            5000,
            "Verify button did not appear"
        );
        await verifyButton.click();

        await handleFaceID(driver);
        const walletsTitle = await verifyWalletsView(driver);
        
        expect(walletsTitle).toBeDefined();
    });

    test('should complete phone authentication flow', async () => {
        // 1. Tap the Phone Authentication button
        const phoneButton = await waitForElement(
            driver,
            '~phoneAuthButton',
            5000,
            "phoneAuthButton did not appear within 5 seconds"
        );
        await phoneButton.click();

        // 2. Enter phone number
        const phoneField = await waitForElement(
            driver,
            '~phoneInputField',
            5000,
            "phoneInputField did not appear"
        );
        await phoneField.click();
        await phoneField.setValue("4085558282");

        // 3. Continue and enter verification code
        const continueButton = await waitForElement(
            driver,
            '~continueButton',
            5000,
            "continueButton did not appear"
        );
        await continueButton.click();

        const codeInput = await waitForElement(
            driver,
            '~verificationCodeField',
            5000,
            "Verification code input field did not appear"
        );
        await codeInput.click();
        await codeInput.setValue(VERIFICATION_CODE);

        // 4. Verify and handle Face ID
        const verifyButton = await waitForElement(
            driver,
            '~verifyButton',
            5000,
            "Verify button did not appear"
        );
        await verifyButton.click();

        await handleFaceID(driver);
        const walletsTitle = await verifyWalletsView(driver);
        
        expect(walletsTitle).toBeDefined();
    });
});