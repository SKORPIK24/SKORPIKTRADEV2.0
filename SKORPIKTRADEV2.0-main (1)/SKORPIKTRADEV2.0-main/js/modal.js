let currentPanel = null;
const modal = document.getElementById('items-modal');
const modalItemsGrid = document.getElementById('modal-items-grid');

function generateModalItems() {
    modalItemsGrid.innerHTML = '';
    
    const activeFilter = document.querySelector('.modal-rarity-filter.active').dataset.rarity;
    
    itemsData.forEach(item => {
        if (activeFilter !== 'all' && item.rarity !== activeFilter) return;
        
        const modalItem = document.createElement('div');
        modalItem.className = 'modal-item';
        modalItem.dataset.id = item.id;
        
        const imageUrl = item.image || 'https://via.placeholder.com/50x50/333333/FFFFFF?text=!';
        
        modalItem.innerHTML = `
            <img src="${imageUrl}" alt="${item.name}" onerror="this.src='  https://via.placeholder.com/50x50/333333/FFFFFF?text=!'">
            <div class="modal-item-name">${item.name}</div>
        `;
        
        modalItem.addEventListener('click', () => {
            addItemToCalculator(currentPanel, item);
            closeModal();
        });
        
        modalItemsGrid.appendChild(modalItem);
    });
}

function openModal(panel) {
    currentPanel = panel;
    document.querySelectorAll('.modal-rarity-filter').forEach(filter => {
        filter.classList.remove('active');
    });
    document.querySelector('.modal-rarity-filter[data-rarity="all"]').classList.add('active');
    
    generateModalItems();
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    modal.style.display = 'none';
    currentPanel = null;
    document.body.style.overflow = 'auto';
}

function setupModal() {
    const closeButton = document.querySelector('.close-modal');
    
    closeButton.addEventListener('click', closeModal);
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal();
        }
    });
}

function setupModalRarityFilters() {
    const filters = document.querySelectorAll('.modal-rarity-filter');
    
    filters.forEach(filter => {
        filter.addEventListener('click', () => {
            filters.forEach(f => f.classList.remove('active'));
            filter.classList.add('active');
            
            generateModalItems();
        });
    });
}