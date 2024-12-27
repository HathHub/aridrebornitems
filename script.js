document.addEventListener("DOMContentLoaded", () => {
    const itemList = document.getElementById("item-list");
    const itemDetails = document.getElementById("item-details");
    const searchBar = document.getElementById("search-bar");

    let itemsData = {};

    // Load JSON data
    fetch("assets.json")
        .then(response => response.json())
        .then(data => {
            itemsData = data;
            populateItemList(data);
        })
        .catch(error => {
            console.error("Error loading JSON:", error);
            itemDetails.textContent = "Error loading items. Please check the console.";
        });

    // Populate item list
    function populateItemList(data) {
        itemList.innerHTML = "";
        for (const [guid, item] of Object.entries(data)) {
            const listItem = document.createElement("li");
            listItem.textContent = item.itemName || "Unknown Item";
            listItem.dataset.guid = guid;
            listItem.classList.add("list-group-item");
            itemList.appendChild(listItem);
        }
    }

    // Add click event to list items
    itemList.addEventListener("click", event => {
        if (event.target.tagName === "LI") {
            const guid = event.target.dataset.guid;
            const item = itemsData[guid];
            itemDetails.innerHTML = syntaxHighlight(JSON.stringify(item, null, 2));
        }
    });

    // Add input event to search bar
    searchBar.addEventListener("input", () => {
        const query = searchBar.value.toLowerCase();
        const filteredData = Object.fromEntries(
            Object.entries(itemsData).filter(([guid, item]) =>
                (item.itemName || "Unknown Item").toLowerCase().includes(query)
            )
        );
        populateItemList(filteredData);
    });

    // Function to syntax highlight JSON
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
