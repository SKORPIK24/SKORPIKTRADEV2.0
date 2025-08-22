class OnlineCounter {
    constructor() {
        this.onlineCount = 0;
        this.ws = null;
        this.reconnectTimeout = null;
        this.init();
    }

    init() {
        this.connectWebSocket();
        this.setupHeartbeat();
    }

    connectWebSocket() {
        try {
            this.ws = new WebSocket('wss://ws.postman-echo.com/raw');
            
            this.ws.onopen = () => {
                console.log('WebSocket connected');
                this.sendOnlineUpdate();
            };

            this.ws.onmessage = (event) => {
                this.handleMessage(event.data);
            };

            this.ws.onclose = () => {
                console.log('WebSocket disconnected, reconnecting...');
                this.scheduleReconnect();
            };

            this.ws.onerror = (error) => {
                console.error('WebSocket error:', error);
            };

        } catch (error) {
            console.error('WebSocket connection failed:', error);
            this.scheduleReconnect();
        }
    }

    handleMessage(data) {
        try {
            const message = JSON.parse(data);
            if (message.type === 'online_update') {
                this.updateOnlineCount(message.count);
            }
        } catch (e) {
            console.log('Raw message:', data);
        }
    }

    sendOnlineUpdate() {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            const message = JSON.stringify({
                type: 'user_online',
                userId: this.getUserId(),
                page: window.location.pathname
            });
            this.ws.send(message);
        }
    }

    updateOnlineCount(count) {
        this.onlineCount = count;
        this.updateIndicator();
    }

    updateIndicator() {
        const indicator = document.querySelector('.online-indicator');
        if (indicator) {
            indicator.querySelector('span').textContent = `Онлайн: ${this.onlineCount}`;
        }
    }

    getUserId() {
        let userId = localStorage.getItem('user_id');
        if (!userId) {
            userId = 'user_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('user_id', userId);
        }
        return userId;
    }

    setupHeartbeat() {
        setInterval(() => {
            if (this.ws && this.ws.readyState === WebSocket.OPEN) {
                this.ws.send(JSON.stringify({ type: 'heartbeat' }));
            }
        }, 30000);
    }

    scheduleReconnect() {
        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
        }
        
        this.reconnectTimeout = setTimeout(() => {
            this.connectWebSocket();
        }, 5000);
    }

    disconnect() {
        if (this.ws) {
            this.ws.close();
        }
        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
        }
    }
}

document.addEventListener('DOMContentLoaded', function() {
    window.onlineCounter = new OnlineCounter();
});