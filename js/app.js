class SkorpikValueApp {
    constructor() {
        this.currentTab = 'items';
        this.activeFilter = 'all';
        this.currentPanel = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadSavedState();
        this.generateItems();
        this.preloadImages();
    }

    setupEventListeners() {
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const tabName = e.currentTarget.dataset.tab;
                this.switchTab(tabName);
            });
        });

        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const rarity = e.currentTarget.dataset.rarity;
                this.setActiveFilter(rarity, e.currentTarget);
            });
        });

        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filterItems(e.target.value);
            });
        }

        const modalSearch = document.getElementById('modal-search');
        if (modalSearch) {
            modalSearch.addEventListener('input', (e) => {
                this.filterModalItems(e.target.value);
            });
        }

        document.querySelectorAll('.add-item-slot').forEach(slot => {
            slot.addEventListener('click', (e) => {
                const panel = e.currentTarget.dataset.panel;
                this.openModal(panel);
            });
        });

        document.querySelector('.modal-close').addEventListener('click', () => {
            this.closeModal();
        });

        document.getElementById('items-modal').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                this.closeModal();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
            }
        });

        const exportBtn = document.getElementById('export-trade');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.exportTradeImage();
            });
        }
    }

    async exportTradeImage() {
        try {
            const exportBtn = document.getElementById('export-trade');
            const originalHtml = exportBtn.innerHTML;
            exportBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Генерация...';
            exportBtn.disabled = true;

            const canvas = await this.createTradeCanvas();
            this.showPreview(canvas);

        } catch (error) {
            console.error('Ошибка генерации изображения:', error);
            alert('Ошибка при создании изображения');
        } finally {
            const exportBtn = document.getElementById('export-trade');
            if (exportBtn) {
                exportBtn.innerHTML = '<i class="fas fa-camera"></i> Сохранить сделку';
                exportBtn.disabled = false;
            }
        }
    }

    async createTradeCanvas() {
        return new Promise((resolve, reject) => {
            try {
                const canvas = document.createElement('canvas');
                canvas.width = 1920;
                canvas.height = 1080;
                const ctx = canvas.getContext('2d');

                const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
                gradient.addColorStop(0, '#0f172a');
                gradient.addColorStop(1, '#1e293b');
                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                ctx.fillStyle = '#dc2626';
                ctx.font = 'bold 60px "Inter", sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText('SKORPIK VALUE', canvas.width / 2, 80);

                ctx.fillStyle = '#cbd5e1';
                ctx.font = '32px "Inter", sans-serif';
                ctx.fillText('СКРИНШОТ СДЕЛКИ', canvas.width / 2, 130);

                ctx.strokeStyle = 'rgba(220, 38, 38, 0.3)';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(canvas.width / 2 - 200, 160);
                ctx.lineTo(canvas.width / 2 + 200, 160);
                ctx.stroke();

                const leftItems = document.querySelectorAll('#left-items .calculator-item');
                const rightItems = document.querySelectorAll('#right-items .calculator-item');

                const totalItems = leftItems.length + rightItems.length;
                const compactMode = totalItems > 8;

                this.drawItemsColumn(ctx, leftItems, canvas.width / 4, 250, 'ДАЮ', compactMode);

                this.drawItemsColumn(ctx, rightItems, canvas.width * 3 / 4, 250, 'ПОЛУЧАЮ', compactMode);

                ctx.strokeStyle = '#dc2626';
                ctx.lineWidth = 4;
                ctx.beginPath();
                ctx.moveTo(canvas.width / 2 - 80, 350);
                ctx.lineTo(canvas.width / 2 + 80, 350);
                ctx.stroke();

                this.drawResults(ctx, canvas.width, canvas.height);

                ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
                ctx.font = '20px "Inter", sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText('Сгенерировано на skorpik-value.ru', canvas.width / 2, canvas.height - 80);
                
                ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
                ctx.font = '18px "Inter", sans-serif';
                ctx.fillText(new Date().toLocaleString('ru-RU'), canvas.width / 2, canvas.height - 40);

                resolve(canvas);
            } catch (error) {
                reject(error);
            }
        });
    }

    async drawItemsColumn(ctx, items, centerX, startY, title, compactMode = false) {
        ctx.fillStyle = '#f8fafc';
        ctx.font = compactMode ? 'bold 32px "Inter", sans-serif' : 'bold 36px "Inter", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(title, centerX, startY);

        let yOffset = startY + 80;

        for (const [index, item] of items.entries()) {
            if (compactMode && index >= 12) break; 
            if (!compactMode && index >= 6) break; 

            const itemData = {
                name: item.dataset.name || 'Предмет',
                quantity: item.dataset.quantity || '1',
                value: parseInt(item.dataset.value || 0),
                demand: parseFloat(item.dataset.demand || 0),
                image: item.querySelector('img')?.src || ''
            };

            if (compactMode) {
                await this.drawCompactItemCard(ctx, centerX - 180, yOffset, itemData);
                yOffset += 60;
            } else {
                await this.drawItemCard(ctx, centerX - 200, yOffset, itemData);
                yOffset += 100;
            }
        }

        if (compactMode && items.length > 12) {
            ctx.fillStyle = '#cbd5e1';
            ctx.font = '20px "Inter", sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(`... и еще ${items.length - 12} предметов`, centerX, yOffset + 20);
        } else if (!compactMode && items.length > 6) {
            ctx.fillStyle = '#cbd5e1';
            ctx.font = '20px "Inter", sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(`... и еще ${items.length - 6} предметов`, centerX, yOffset + 20);
        }

        if (items.length > 0) {
            const totalValue = Array.from(items).reduce((sum, item) => {
                return sum + (parseInt(item.dataset.value || 0) * parseInt(item.dataset.quantity || 1));
            }, 0);

            const totalQuantity = Array.from(items).reduce((sum, item) => {
                return sum + parseInt(item.dataset.quantity || 1);
            }, 0);

            const totalDemand = Array.from(items).reduce((sum, item) => {
                return sum + (parseFloat(item.dataset.demand || 0) * parseInt(item.dataset.quantity || 1));
            }, 0) / totalQuantity;

            const statsY = compactMode ? yOffset + 50 : yOffset + 40;

            ctx.fillStyle = '#dc2626';
            ctx.font = compactMode ? 'bold 24px "Inter", sans-serif' : 'bold 28px "Inter", sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('ИТОГО:', centerX, statsY);

            ctx.fillStyle = '#cbd5e1';
            ctx.font = compactMode ? '20px "Inter", sans-serif' : '24px "Inter", sans-serif';
            ctx.fillText(`Стоимость: ${totalValue.toLocaleString()}`, centerX, statsY + 40);
            ctx.fillText(`Спрос: ${totalDemand.toFixed(1)}/10`, centerX, statsY + 80);
        }
    }

    async drawCompactItemCard(ctx, x, y, itemData) {
        try {
            const img = new Image();
            await new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = reject;
                img.src = itemData.image || 'https://via.placeholder.com/40x40/333/fff?text=!';
            });

            ctx.fillStyle = 'rgba(30, 41, 59, 0.9)';
            ctx.strokeStyle = 'rgba(220, 38, 38, 0.3)';
            ctx.lineWidth = 2;
            this.roundRect(ctx, x, y, 360, 50, 8);
            ctx.fill();
            ctx.stroke();

            ctx.drawImage(img, x + 5, y + 5, 40, 40);

            ctx.fillStyle = '#f8fafc';
            ctx.font = 'bold 16px "Inter", sans-serif';
            ctx.textAlign = 'left';
            
            let displayName = itemData.name;
            if (displayName.length > 20) {
                displayName = displayName.substring(0, 17) + '...';
            }
            
            ctx.fillText(`${itemData.quantity}x ${displayName}`, x + 50, y + 20);

            ctx.fillStyle = '#cbd5e1';
            ctx.font = '14px "Inter", sans-serif';
            ctx.fillText(`${itemData.value.toLocaleString()} | ${itemData.demand}/10`, x + 50, y + 40);

        } catch (error) {
            console.error('Ошибка загрузки изображения:', error);
            this.drawCompactItemCardFallback(ctx, x, y, itemData);
        }
    }

    drawCompactItemCardFallback(ctx, x, y, itemData) {
        ctx.fillStyle = 'rgba(30, 41, 59, 0.9)';
        ctx.strokeStyle = 'rgba(220, 38, 38, 0.3)';
        ctx.lineWidth = 2;
        this.roundRect(ctx, x, y, 360, 50, 8);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#334155';
        this.roundRect(ctx, x + 5, y + 5, 40, 40, 6);
        ctx.fill();
        
        ctx.fillStyle = '#cbd5e1';
        ctx.font = '10px "Inter", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('No Img', x + 25, y + 25);

        let displayName = itemData.name;
        if (displayName.length > 20) {
            displayName = displayName.substring(0, 17) + '...';
        }
        
        ctx.fillStyle = '#f8fafc';
        ctx.font = 'bold 16px "Inter", sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(`${itemData.quantity}x ${displayName}`, x + 50, y + 20);

        ctx.fillStyle = '#cbd5e1';
        ctx.font = '14px "Inter", sans-serif';
        ctx.fillText(`${itemData.value.toLocaleString()} | ${itemData.demand}/10`, x + 50, y + 40);
    }

    async drawItemCard(ctx, x, y, itemData) {
        try {
            const img = new Image();
            await new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = reject;
                img.src = itemData.image || 'https://via.placeholder.com/60x60/333/fff?text=!';
            });

            ctx.fillStyle = 'rgba(30, 41, 59, 0.9)';
            ctx.strokeStyle = 'rgba(220, 38, 38, 0.3)';
            ctx.lineWidth = 2;
            this.roundRect(ctx, x, y, 400, 80, 12);
            ctx.fill();
            ctx.stroke();


            ctx.drawImage(img, x + 10, y + 10, 60, 60);


            ctx.fillStyle = '#f8fafc';
            ctx.font = 'bold 20px "Inter", sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText(`${itemData.quantity}x ${itemData.name}`, x + 80, y + 25);


            ctx.fillStyle = '#cbd5e1';
            ctx.font = '16px "Inter", sans-serif';
            ctx.fillText(`Цена: ${itemData.value.toLocaleString()}`, x + 80, y + 50);
            ctx.fillText(`Спрос: ${itemData.demand}/10`, x + 250, y + 50);

        } catch (error) {
            console.error('Ошибка загрузки изображения:', error);
            this.drawItemCardFallback(ctx, x, y, itemData);
        }
    }

    drawItemCardFallback(ctx, x, y, itemData) {

        ctx.fillStyle = 'rgba(30, 41, 59, 0.9)';
        ctx.strokeStyle = 'rgba(220, 38, 38, 0.3)';
        ctx.lineWidth = 2;
        this.roundRect(ctx, x, y, 400, 80, 12);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#334155';
        this.roundRect(ctx, x + 10, y + 10, 60, 60, 8);
        ctx.fill();
        
        ctx.fillStyle = '#cbd5e1';
        ctx.font = '12px "Inter", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('No Image', x + 40, y + 40);

        ctx.fillStyle = '#f8fafc';
        ctx.font = 'bold 20px "Inter", sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(`${itemData.quantity}x ${itemData.name}`, x + 80, y + 25);

        ctx.fillStyle = '#cbd5e1';
        ctx.font = '16px "Inter", sans-serif';
        ctx.fillText(`Цена: ${itemData.value.toLocaleString()}`, x + 80, y + 50);
        ctx.fillText(`Спрос: ${itemData.demand}/10`, x + 250, y + 50);
    }

        drawResults(ctx, width, height) {
        const valueDiff = document.getElementById('value-difference').textContent;
        const demandDiff = document.getElementById('demand-difference').textContent;
        const demandStatus = document.getElementById('demand-status').textContent;

        const yPosition = height - 300;

        ctx.fillStyle = 'rgba(30, 41, 59, 0.95)';
        this.roundRect(ctx, width / 2 - 300, yPosition, 600, 150, 20);
        ctx.fill();

        ctx.strokeStyle = 'rgba(220, 38, 38, 0.5)';
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.fillStyle = '#f8fafc';
        ctx.font = 'bold 36px "Inter", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('РЕЗУЛЬТАТЫ ОБМЕНА', width / 2, yPosition + 50);

        const valueColor = valueDiff.includes('-') ? '#ef4444' : '#10b981';
        ctx.fillStyle = valueColor;
        ctx.font = 'bold 32px "Inter", sans-serif';
        ctx.fillText(`Разница стоимости: ${valueDiff}`, width / 2, yPosition + 100);

        const demandColor = demandStatus === '↓' ? '#ef4444' : demandStatus === '↑' ? '#10b981' : '#f59e0b';
        ctx.fillStyle = demandColor;
        ctx.font = '28px "Inter", sans-serif';
        ctx.fillText(`Разница спроса: ${demandDiff} ${demandStatus}`, width / 2, yPosition + 140);
    }

    roundRect(ctx, x, y, width, height, radius) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
    }

    showPreview(canvas) {
        const modal = document.createElement('div');
        modal.className = 'export-preview-modal';
        modal.style.display = 'flex';
        modal.innerHTML = `
            <div class="export-preview-content">
                <img class="export-preview-image" src="${canvas.toDataURL('image/png')}" alt="Предпросмотр сделки">
                <div class="export-preview-buttons">
                    <button class="export-preview-btn export-download-btn">
                        <i class="fas fa-download"></i> Скачать PNG
                    </button>
                    <button class="export-preview-btn export-cancel-btn">
                        <i class="fas fa-times"></i> Отмена
                    </button>
                </div>
            </div>
        `;

        modal.querySelector('.export-download-btn').addEventListener('click', () => {
            this.downloadImage(canvas);
            modal.remove();
        });

        modal.querySelector('.export-cancel-btn').addEventListener('click', () => {
            modal.remove();
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });

        document.body.appendChild(modal);
    }

    downloadImage(canvas) {
        const link = document.createElement('a');
        link.download = `skorpik-trade-${new Date().toISOString().slice(0, 10)}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    }

    switchTab(tabName) {
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`.nav-tab[data-tab="${tabName}"]`).classList.add('active');

        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabName}-content`).classList.add('active');

        this.currentTab = tabName;
        localStorage.setItem('activeTab', tabName);

        if (tabName === 'calculator') {
            this.updateCalculatorResults();
        }
    }

    setActiveFilter(rarity, element) {
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        document.querySelectorAll(`.filter-btn[data-rarity="${rarity}"]`).forEach(btn => {
            btn.classList.add('active');
        });

        this.activeFilter = rarity;
        localStorage.setItem('activeFilter', rarity);
        this.generateItems();
    }

    generateItems() {
        const itemsGrid = document.getElementById('items-grid');
        if (!itemsGrid) return;

        itemsGrid.innerHTML = '';
        
        const searchTerm = document.getElementById('search-input')?.value.toLowerCase() || '';
        
        itemsData.forEach(item => {
            if (this.activeFilter !== 'all' && item.rarity !== this.activeFilter) return;
            if (searchTerm && !item.name.toLowerCase().includes(searchTerm)) return;
            
            this.createItemCard(itemsGrid, item);
        });
    }

    createItemCard(container, item) {
        const itemCard = document.createElement('div');
        itemCard.className = 'item-card';
        itemCard.dataset.rarity = item.rarity;
        
        const demandPercent = (item.demand / 10) * 100;
        const statusClass = this.getStatusClass(item.status);
        const demandClass = this.getDemandClass(item.status);
        
        const imageUrl = item.image || 'https://via.placeholder.com/253x280/333/fff?text=No+Image';
        
        itemCard.innerHTML = `
            <div class="item-image">
                <img src="${imageUrl}" alt="${item.name}" onerror="this.src='https://via.placeholder.com/253x280/333/fff?text=No+Image'">
            </div>
            <div class="item-content">
                <div class="item-header">
                    <h3 class="item-title">${item.name}</h3>
                    <span class="item-rarity ${item.rarity.toLowerCase()}">${this.getRarityName(item.rarity)}</span>
                </div>
                
                <div class="item-stats">
                    <div class="stat">
                        <span class="stat-label">Value</span>
                        <span class="stat-value">${item.value.toLocaleString()}</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">Status</span>
                        <span class="stat-value ${statusClass}">${item.status}</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">Demand</span>
                        <span class="stat-value ${statusClass}">${item.demand}/10</span>
                        <div class="demand-bar">
                            <div class="demand-fill ${demandClass}" style="width: ${demandPercent}%"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        container.appendChild(itemCard);
    }

    filterItems(searchTerm) {
        const items = document.querySelectorAll('.item-card');
        const term = searchTerm.toLowerCase();
        
        items.forEach(item => {
            const itemName = item.querySelector('.item-title').textContent.toLowerCase();
            item.style.display = itemName.includes(term) ? 'block' : 'none';
        });
    }

    openModal(panel) {
        this.currentPanel = panel;
        const modal = document.getElementById('items-modal');
        
        document.querySelectorAll('.modal-filters .filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector('.modal-filters .filter-btn[data-rarity="all"]').classList.add('active');
        
        const searchInput = document.getElementById('modal-search');
        if (searchInput) searchInput.value = '';
        
        this.generateModalItems();
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    closeModal() {
        const modal = document.getElementById('items-modal');
        modal.style.display = 'none';
        this.currentPanel = null;
        document.body.style.overflow = 'auto';
    }

    generateModalItems() {
        const modalGrid = document.getElementById('modal-items-grid');
        if (!modalGrid) return;

        modalGrid.innerHTML = '';
        
        const activeFilter = document.querySelector('.modal-filters .filter-btn.active')?.dataset.rarity || 'all';
        const searchTerm = document.getElementById('modal-search')?.value.toLowerCase() || '';
        
        itemsData.forEach(item => {
            if (activeFilter !== 'all' && item.rarity !== activeFilter) return;
            if (searchTerm && !item.name.toLowerCase().includes(searchTerm)) return;
            
            const modalItem = document.createElement('div');
            modalItem.className = 'modal-item';
            modalItem.dataset.id = item.id;
            
            const imageUrl = item.image || 'https://via.placeholder.com/80x80/333/fff?text=!';
            
            modalItem.innerHTML = `
                <img src="${imageUrl}" alt="${item.name}" onerror="this.src='https://via.placeholder.com/80x80/333/fff?text=!'">
                <div class="modal-item-name">${item.name}</div>
            `;
            
            modalItem.addEventListener('click', () => {
                this.addItemToCalculator(this.currentPanel, item);
                this.closeModal();
            });
            
            modalGrid.appendChild(modalItem);
        });
    }

    filterModalItems(searchTerm) {
        const modalItems = document.querySelectorAll('.modal-item');
        const term = searchTerm.toLowerCase();
        
        modalItems.forEach(item => {
            const itemName = item.querySelector('.modal-item-name').textContent.toLowerCase();
            item.style.display = itemName.includes(term) ? 'block' : 'none';
        });
    }

    addItemToCalculator(panel, itemData) {
        const container = document.getElementById(`${panel}-items`);
        const addButton = container.querySelector('.add-item-slot');
        
        const existingItem = container.querySelector(`.calculator-item[data-id="${itemData.id}"]`);
        
        if (existingItem) {
            let quantity = parseInt(existingItem.dataset.quantity);
            quantity++;
            existingItem.dataset.quantity = quantity;
            existingItem.querySelector('.item-quantity').textContent = quantity;
        } else {
            const itemElement = document.createElement('div');
            itemElement.className = 'calculator-item';
            itemElement.dataset.id = itemData.id;
            itemElement.dataset.name = itemData.name;
            itemElement.dataset.value = itemData.value;
            itemElement.dataset.demand = itemData.demand;
            itemElement.dataset.quantity = 1;
            
            const imageUrl = itemData.image || 'https://via.placeholder.com/60x60/333/fff?text=!';
            
            itemElement.innerHTML = `
                <img src="${imageUrl}" alt="${itemData.name}" onerror="this.src='https://via.placeholder.com/60x60/333/fff?text=!'">
                <span class="item-quantity">1</span>
                <button class="remove-item">&times;</button>
            `;
            
            const removeBtn = itemElement.querySelector('.remove-item');
            removeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                itemElement.remove();
                this.updateCalculatorResults();
                this.repositionAddButton(container);
            });
            
            container.insertBefore(itemElement, addButton);
        }
        
        this.updateCalculatorResults();
        this.repositionAddButton(container);
    }

    repositionAddButton(container) {
        const addButton = container.querySelector('.add-item-slot');
        container.appendChild(addButton);
    }

    updateCalculatorResults() {
        const leftItems = document.querySelectorAll('#left-items .calculator-item');
        const rightItems = document.querySelectorAll('#right-items .calculator-item');
        
        let leftValue = 0;
        let leftDemand = 0;
        let leftTotalItems = 0;
        
        leftItems.forEach(item => {
            const quantity = parseInt(item.dataset.quantity);
            leftValue += parseInt(item.dataset.value) * quantity;
            leftDemand += parseFloat(item.dataset.demand) * quantity;
            leftTotalItems += quantity;
        });
        
        let rightValue = 0;
        let rightDemand = 0;
        let rightTotalItems = 0;
        
        rightItems.forEach(item => {
            const quantity = parseInt(item.dataset.quantity);
            rightValue += parseInt(item.dataset.value) * quantity;
            rightDemand += parseFloat(item.dataset.demand) * quantity;
            rightTotalItems += quantity;
        });
        
        const valueDifference = rightValue - leftValue;
        const valueElement = document.getElementById('value-difference');
        valueElement.textContent = valueDifference.toLocaleString();
        
        if (valueDifference > 0) {
            valueElement.style.color = 'var(--success)';
        } else if (valueDifference < 0) {
            valueElement.style.color = 'var(--danger)';
        } else {
            valueElement.style.color = 'var(--warning)';
        }
        
        const avgLeftDemand = leftTotalItems > 0 ? leftDemand / leftTotalItems : 0;
        const avgRightDemand = rightTotalItems > 0 ? rightDemand / rightTotalItems : 0;
        const demandDifference = (avgRightDemand - avgLeftDemand).toFixed(1);
        
        const demandElement = document.getElementById('demand-difference');
        const demandStatus = document.getElementById('demand-status');
        
        demandElement.textContent = Math.abs(demandDifference);
        
        if (demandDifference > 0) {
            demandStatus.textContent = '↑';
            demandStatus.className = 'demand-indicator demand-positive';
            demandElement.style.color = 'var(--success)';
        } else if (demandDifference < 0) {
            demandStatus.textContent = '↓';
            demandStatus.className = 'demand-indicator';
            demandElement.style.color = 'var(--danger)';
        } else {
            demandStatus.textContent = '=';
            demandStatus.className = 'demand-indicator';
            demandElement.style.color = 'var(--warning)';
        }
    }

    loadSavedState() {
        const savedTab = localStorage.getItem('activeTab');
        if (savedTab) {
            this.switchTab(savedTab);
        }
        
        const savedFilter = localStorage.getItem('activeFilter');
        if (savedFilter) {
            const filterBtn = document.querySelector(`.filter-btn[data-rarity="${savedFilter}"]`);
            if (filterBtn) {
                this.setActiveFilter(savedFilter, filterBtn);
            }
        }
    }

    preloadImages() {
        itemsData.forEach(item => {
            if (item.image) {
                const img = new Image();
                img.src = item.image;
            }
        });
    }

    getStatusClass(status) {
        status = status.toLowerCase();
        if (status.includes('stable')) return 'status-stable';
        if (status.includes('big rising')) return 'status-big-rising';
        if (status.includes('rising')) return 'status-rising';
        if (status.includes('dropping')) return 'status-dropping';
        return 'status-stable';
    }

    getDemandClass(status) {
        status = status.toLowerCase();
        if (status.includes('stable')) return 'demand-stable';
        if (status.includes('big rising')) return 'demand-big-rising';
        if (status.includes('rising')) return 'demand-rising';
        if (status.includes('dropping')) return 'demand-dropping';
        return 'demand-stable';
    }

    getRarityName(rarity) {
        const names = {
            'Divine': 'Божественный',
            'Exclusive': 'Эксклюзивный',
            'Pass': 'Пасc'
        };
        return names[rarity] || rarity;
    }
}

document.addEventListener('DOMContentLoaded', function() {
    window.skorpikApp = new SkorpikValueApp();
});