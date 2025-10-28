function addItemToCalculator(panel, itemData) {
    const container = document.getElementById(`${panel}-items`);
    
    const emptyMessage = container.querySelector('.empty-list');
    if (emptyMessage) {
        emptyMessage.remove();
    }
    
    const existingItem = container.querySelector(`.calculator-item[data-id="${itemData.id}"]`);
    
    if (existingItem) {
        const quantityElement = existingItem.querySelector('.quantity-value');
        let quantity = parseInt(quantityElement.textContent);
        quantity++;
        quantityElement.textContent = quantity;
        
        existingItem.dataset.quantity = quantity;
    } else {
        const itemElement = document.createElement('div');
        itemElement.className = 'calculator-item';
        itemElement.dataset.id = itemData.id;
        itemElement.dataset.value = itemData.value;
        itemElement.dataset.demand = itemData.demand;
        itemElement.dataset.quantity = 1;
        
        const imageUrl = itemData.image || 'https://via.placeholder.com/40x40/333333/FFFFFF?text=!';
        
        itemElement.innerHTML = `
            <img src="${imageUrl}" alt="${itemData.name}" onerror="this.src='  https://via.placeholder.com/40x40/333333/FFFFFF?text=!'">
            <div class="calculator-item-info">
                <div class="calculator-item-name">${itemData.name}</div>
                <div class="calculator-item-price">${itemData.value.toLocaleString()}</div>
                <div class="calculator-item-demand">Demand: ${itemData.demand}/10</div>
                <div class="quantity-controls">
                    <button class="quantity-btn minus">-</button>
                    <span class="quantity-value">1</span>
                    <button class="quantity-btn plus">+</button>
                </div>
            </div>
            <button class="remove-item">&times;</button>
        `;
        
        const minusBtn = itemElement.querySelector('.minus');
        const plusBtn = itemElement.querySelector('.plus');
        const quantityValue = itemElement.querySelector('.quantity-value');
        const removeBtn = itemElement.querySelector('.remove-item');
        
        minusBtn.addEventListener('click', function() {
            let quantity = parseInt(quantityValue.textContent);
            if (quantity > 1) {
                quantity--;
                quantityValue.textContent = quantity;
                itemElement.dataset.quantity = quantity;
                updateCalculatorResults();
            }
        });
        
        plusBtn.addEventListener('click', function() {
            let quantity = parseInt(quantityValue.textContent);
            quantity++;
            quantityValue.textContent = quantity;
            itemElement.dataset.quantity = quantity;
            updateCalculatorResults();
        });
        
        removeBtn.addEventListener('click', function() {
            itemElement.remove();
            
            if (container.children.length === 0) {
                const emptyMsg = document.createElement('div');
                emptyMsg.className = 'empty-list';
                emptyMsg.textContent = 'Нажмите + чтобы добавить предметы';
                container.appendChild(emptyMsg);
            }
            
            updateCalculatorResults();
        });
        
        container.appendChild(itemElement);
    }
    
    updateCalculatorResults();
}

function updateCalculatorResults() {
    const leftItems = document.querySelectorAll('#left-items .calculator-item');
    const rightItems = document.querySelectorAll('#right-items .calculator-item');
    
    let leftValue = 0;
    leftItems.forEach(item => {
        const quantity = parseInt(item.dataset.quantity);
        leftValue += parseInt(item.dataset.value) * quantity;
    });
    
    let rightValue = 0;
    rightItems.forEach(item => {
        const quantity = parseInt(item.dataset.quantity);
        rightValue += parseInt(item.dataset.value) * quantity;
    });
    
    let leftDemand = 0;
    let leftTotalItems = 0;
    
    if (leftItems.length > 0) {
        leftItems.forEach(item => {
            const quantity = parseInt(item.dataset.quantity);
            leftDemand += parseFloat(item.dataset.demand) * quantity;
            leftTotalItems += quantity;
        });
        leftDemand = (leftDemand / leftTotalItems).toFixed(1);
    }
    
    let rightDemand = 0;
    let rightTotalItems = 0;
    
    if (rightItems.length > 0) {
        rightItems.forEach(item => {
            const quantity = parseInt(item.dataset.quantity);
            rightDemand += parseFloat(item.dataset.demand) * quantity;
            rightTotalItems += quantity;
        });
        rightDemand = (rightDemand / rightTotalItems).toFixed(1);
    }
    
    document.getElementById('left-total-value').textContent = leftValue.toLocaleString();
    document.getElementById('right-total-value').textContent = rightValue.toLocaleString();
    document.getElementById('left-total-demand').textContent = leftDemand;
    document.getElementById('right-total-demand').textContent = rightDemand;
    
    const valueDifference = rightValue - leftValue;
    const valueElement = document.getElementById('value-difference');
    valueElement.textContent = valueDifference.toLocaleString();
    
    if (valueDifference > 0) {
        valueElement.style.color = 'var(--rising-color)';
    } else if (valueDifference < 0) {
        valueElement.style.color = 'var(--dropping-color)';
    } else {
        valueElement.style.color = 'var(--stable-color)';
    }
    
    const demandDifference = (rightDemand - leftDemand).toFixed(1);
    const demandElement = document.getElementById('demand-difference');
    const demandStatus = document.getElementById('demand-status');
    
    demandElement.textContent = Math.abs(demandDifference);
    
    if (demandDifference > 0) {
        demandStatus.textContent = '↑';
        demandStatus.className = 'demand-difference demand-positive';
        demandElement.style.color = 'var(--rising-color)';
    } else if (demandDifference < 0) {
        demandStatus.textContent = '↓';
        demandStatus.className = 'demand-difference';
        demandElement.style.color = 'var(--dropping-color)';
    } else {
        demandStatus.textContent = '=';
        demandStatus.className = 'demand-difference';
        demandElement.style.color = 'var(--stable-color)';
    }
}

function setupAddItemButtons() {
    const addButtons = document.querySelectorAll('.add-item-btn');
    
    addButtons.forEach(button => {
        button.addEventListener('click', () => {
            const panel = button.dataset.panel;
            openModal(panel);
        });
    });
}