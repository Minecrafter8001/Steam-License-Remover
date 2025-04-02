// ==UserScript==
// @name         Steam License Remover (Date Filtered)
// @namespace    
// @version      2.2
// @description  Remove free games from your Steam Library added on a specific date
// @author       IroN404
// @fork_comission Beardox
// @match        https://store.steampowered.com/account/licenses/
// ==/UserScript==

let removedCount = 0;
const targetDate = '17 May, 2024'; // CHANGE THIS TO YOUR TARGET DATE

async function removeGame(id) {
    console.log(`Removing game with ID ${id}...`);
    try {
        const response = await fetch('https://store.steampowered.com/account/removelicense', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: `sessionid=${encodeURIComponent(g_sessionID)}&packageid=${encodeURIComponent(id)}`
        });

        if (response.ok) {
            const data = await response.json();
            if (data.success) {
                removedCount++;
                console.log(`Game with ID ${id} removed successfully. Total removed: ${removedCount}`);
            } else {
                console.log(`Failed to remove game with ID ${id}.`);
            }
        } else {
            console.log(`Failed to remove game with ID ${id}. Status: ${response.status}`);
        }
    } catch (error) {
        console.error(`Error removing game with ID ${id}:`, error);
    }
}

function extractIdFromLink(link) {
    const match = link.match(/RemoveFreeLicense\(\s*(\d+)\s*,/);
    return match ? match[1] : null;
}

function collectTargetGames() {
    const targetGames = [];
    const removeLinks = document.querySelectorAll('a[href^="javascript:RemoveFreeLicense"]');
    
    for (const link of removeLinks) {
        const row = link.closest('tr');
        if (!row) continue;
        
        const dateCell = row.querySelector('td.license_date_col');
        if (!dateCell) continue;
        
        const gameDate = dateCell.textContent.trim();
        if (gameDate === targetDate) {
            const packageId = extractIdFromLink(link.href);
            if (packageId) {
                targetGames.push(packageId);
            }
        }
    }
    
    return targetGames;
}

async function processRemovals() {
    const targetGames = collectTargetGames();
    const totalGames = targetGames.length;
    
    console.log(`Found ${totalGames} games added on ${targetDate}`);
    if (totalGames === 0) return;

    const progressInterval = setInterval(() => {
        console.log(`Progress: ${removedCount}/${totalGames} removed`);
        if (removedCount >= totalGames) clearInterval(progressInterval);
    }, 1000);

    for (const packageId of targetGames) {
        await removeGame(packageId);
        await new Promise(resolve => setTimeout(resolve, 2000));
    }

    console.log(`Finished! Total games removed: ${removedCount}`);
}

// Start the process
processRemovals();
