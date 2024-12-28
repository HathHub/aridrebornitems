document.addEventListener("DOMContentLoaded", () => {
    const itemList = document.getElementById("item-list");
    const itemDetails = document.getElementById("item-details");
    const searchBar = document.getElementById("search-bar");
    const toggleViewButton = document.getElementById("toggle-view");

    let itemsData = {};
    let currentItem = null;
    let showFullDetails = false;

    fetch("assets.json")
        .then(response => response.json())
        .then(data => {
            itemsData = data;
            populateItemList(data);
            const urlParams = new URLSearchParams(window.location.search);
            const guid = urlParams.get('guid');
            if (guid && itemsData[guid]) {
                displayItemDetails(guid);
            }
        })
        .catch(error => {
            console.error("Error loading JSON:", error);
            itemDetails.textContent = "Error loading items. Please check the console.";
        });

    function populateItemList(data) {
        itemList.innerHTML = "";
        for (const [guid, item] of Object.entries(data)) {
            const listItem = document.createElement("li");
            listItem.textContent = item.FriendlyName || "Sin nombre";
            listItem.dataset.guid = guid;
            listItem.classList.add("list-group-item");
            itemList.appendChild(listItem);
        }
    }

    itemList.addEventListener("click", event => {
        if (event.target.tagName === "LI") {
            const guid = event.target.dataset.guid;
            displayItemDetails(guid);
            updateURL(guid);
        }
    });

    searchBar.addEventListener("input", () => {
        const query = searchBar.value.toLowerCase();
        const filteredData = Object.fromEntries(
            Object.entries(itemsData).filter(([guid, item]) =>
                (item.itemName || "Unknown Item").toLowerCase().includes(query)
            )
        );
        populateItemList(filteredData);
    });

    toggleViewButton.addEventListener("click", () => {
        showFullDetails = !showFullDetails;
        if (currentItem) {
            displayItemDetails(currentItem);
        }
        toggleViewButton.textContent = showFullDetails ? "-" : "+";
    });

    function displayItemDetails(guid) {
        currentItem = guid;
        const item = itemsData[guid];
        const displayData = showFullDetails ? item : getWhitelistedFields(item);
        itemDetails.innerHTML = syntaxHighlight(JSON.stringify(displayData, null, 2));
    }

    function updateURL(guid) {
        const url = new URL(window.location);
        url.searchParams.set('guid', guid);
        window.history.pushState({}, '', url);
    }

    function getWhitelistedFields(item) {
        const whitelist = [
            "id",
            "FriendlyName",
            "type",
            "rarity",
            "playerDamageMultiplier",
            "firerate",
            "zombieDamageMultiplier",
            "type",
            "rarity",
            "explosionArmor",
            "armor",
            "barricadeDamage",
            "playerDamage",
            "structureDamage",
            "vehicleDamage",
            "health",
            "range",
            "bypassClaim",
            "range2"
            ];
        return Object.fromEntries(Object.entries(item).filter(([key]) => whitelist.includes(key)));
    }

    function syntaxHighlight(json) {
        json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:\s*)?|true|false|null|\b\d+\b)/g, function (match) {
            let cls = 'number';
            if (/^"/.test(match)) {
                if (/:$/.test(match)) {
                    cls = 'key';
                } else {
                    cls = 'string';
                }
            } else if (/true|false/.test(match)) {
                cls = 'boolean';
            } else if (/null/.test(match)) {
                cls = 'null';
            }
            return '<span class="' + cls + '">' + match + '</span>';
        });
    }
});
