function onOpen(e: GoogleAppsScript.Events.SheetsOnOpen) {
    const { UI } = Constants;
    UI.createMenu('Referee')
        .addItem('Authorize scripts', 'Authorization.authorize')
        .addSubMenu(
            UI.createMenu('API Key')
                .addItem('Add API key', 'OsuApiKeyManager.showKeyStoringPrompt')
                .addItem('Remove API key', 'OsuApiKeyManager.removeKeyStoringPrompt'),
        )
        .addItem('Set HTTP delay', 'HttpDelayManager.showPrompt')
        .addItem('Debug', 'Debug.test')
        .addToUi();
}
