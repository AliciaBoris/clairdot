// Define global inventory array and profit, load from local storage if available
let inventory = JSON.parse(localStorage.getItem('inventoryData')) || [];
let totalProfit = parseFloat(localStorage.getItem('totalProfit')) || 0;

// Save data to local storage
function saveToLocalStorage() {
    localStorage.setItem('inventoryData', JSON.stringify(inventory));
    localStorage.setItem('totalProfit', totalProfit.toString());
}

document.getElementById('addItemForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const itemName = document.getElementById('itemName').value;
    const addedDateTime = document.getElementById('addedDateTime').value;
    const costPrice = parseFloat(document.getElementById('costPrice').value);
    const sellingPrice = parseFloat(document.getElementById('sellingPrice').value);
    const quantity = parseInt(document.getElementById('quantity').value);

    // Create a new item with default profit set to 0
    const item = { itemName, addedDateTime, costPrice, sellingPrice, quantity, profit: 0 };
    inventory.push(item);

    // Save to local storage and update the table and summary
    saveToLocalStorage();
    updateTable();
    updateSummary();
    document.getElementById('addItemForm').reset();
});

function updateTable(searchQuery = '') {
    const tableBody = document.getElementById('inventoryTable');
    tableBody.innerHTML = ''; // Clear previous rows

    inventory.forEach((item, index) => {
        if (item.itemName.toLowerCase().includes(searchQuery)) {
            const itemTotalCost = item.costPrice * item.quantity;

            // Create a row for the item
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.itemName}</td>
                <td>${item.addedDateTime}</td>
                <td>${formatNumber(item.costPrice)}</td>
                <td>${formatNumber(item.sellingPrice)}</td>
                <td>${item.quantity}</td>
                <td>${formatNumber(itemTotalCost)}</td>
                <td>${formatNumber(item.profit)}</td>
                <td>
                    <button onclick="sellItem(${index})">Sell</button>
                    <button onclick="updateItem(${index})">Update</button>
                    <button onclick="deleteItem(${index})">Delete</button>
                </td>
            `;
            tableBody.appendChild(row);
        }
    });

    // Update total inventory cost in the summary
    const totalCost = inventory.reduce((sum, item) => sum + item.costPrice * item.quantity, 0);
    document.getElementById('totalCost').textContent = formatNumber(totalCost);
}

function sellItem(index) {
    const quantityToSell = prompt("Enter quantity to sell:");
    const quantity = parseInt(quantityToSell);

    if (isNaN(quantity) || quantity <= 0) {
        alert("Please enter a valid quantity.");
        return;
    }

    const item = inventory[index];
    if (quantity > item.quantity) {
        alert("Quantity exceeds available stock.");
        return;
    }

    const soldAmount = quantity * item.sellingPrice;
    const profit = soldAmount - (item.costPrice * quantity); // Calculate profit from the sale
    item.profit += profit; // Update item's profit in the table
    totalProfit += profit; // Increment total profit
    item.quantity -= quantity;

    if (item.quantity === 0) {
        inventory.splice(index, 1); // Remove item if quantity is 0
    }

    // Save to local storage, update table and summary
    saveToLocalStorage();
    updateTable();
    updateSummary();
    alert(`Sold ${quantity} of ${item.itemName}. Total Sold: ${formatNumber(soldAmount)}. Profit: ${formatNumber(profit)}`);
}

function updateItem(index) {
    const item = inventory[index];
    const updatedName = prompt("Enter new item name:", item.itemName);
    const updatedCostPrice = parseFloat(prompt("Enter new cost price:", item.costPrice));
    const updatedSellingPrice = parseFloat(prompt("Enter new selling price:", item.sellingPrice));
    const updatedQuantity = parseInt(prompt("Enter new quantity:", item.quantity));
    const updatedDateTime = prompt("Enter new date and time (YYYY-MM-DDTHH:mm):", item.addedDateTime);

    if (
        updatedName &&
        !isNaN(updatedCostPrice) &&
        !isNaN(updatedSellingPrice) &&
        !isNaN(updatedQuantity) &&
        updatedDateTime
    ) {
        item.itemName = updatedName;
        item.costPrice = updatedCostPrice;
        item.sellingPrice = updatedSellingPrice;
        item.quantity = updatedQuantity;
        item.addedDateTime = updatedDateTime;

        // Save to local storage, update table and summary
        saveToLocalStorage();
        updateTable();
        updateSummary();
        alert("Item updated successfully.");
    } else {
        alert("Invalid input. Item not updated.");
    }
}

function deleteItem(index) {
    const confirmDelete = confirm("Are you sure you want to delete this item?");
    if (confirmDelete) {
        inventory.splice(index, 1); // Remove item from inventory

        // Save to local storage, update table and summary
        saveToLocalStorage();
        updateTable();
        updateSummary();
        alert("Item deleted successfully.");
    }
}

function updateSummary() {
    // Update the profit display only
    document.getElementById('totalProfit').textContent = formatNumber(totalProfit);
}

function formatNumber(num) {
    return num.toLocaleString('en-US');
}

// Search functionality
document.getElementById('searchBar').addEventListener('input', (e) => {
    const searchQuery = e.target.value.toLowerCase();
    updateTable(searchQuery);
});

// Load data on page load
document.addEventListener('DOMContentLoaded', () => {
    updateTable(); // Populate the table with data from local storage
    updateSummary(); // Update the profit summary
    alert(`Total Profit: ${formatNumber(totalProfit)}`);
});
