function onOpen(e: GoogleAppsScript.Events.SheetsOnOpen) {
    const UI = SpreadsheetApp.getUi();
    UI.createMenu('Referee')
        .addItem('Authorize scripts', 'Authorization.authorize')
        .addSubMenu(
            UI.createMenu('API Key')
                .addItem('Add API key', 'OsuApiKeyManager.showKeyStoringPrompt')
                .addItem('Remove API key', 'OsuApiKeyManager.removeKeyStoringPrompt'),
        )
        .addSubMenu(
            UI.createMenu('Match')
                .addItem('Create', 'MatchManager.create')
                .addItem('Refresh', 'MatchManager.refresh')
                .addItem('Generate maps', 'MatchManager.generateMaps')
                .addItem('Update winners', 'MatchManager.updateWinners'),
        )
        .addItem('Set HTTP delay', 'HttpDelayManager.showPrompt')
        .addSubMenu(
            UI.createMenu('Developer').addItem('Gen maps', 'Developer.genMaps').addItem('Debug', 'Developer.debug'),
        )
        .addToUi();
}
