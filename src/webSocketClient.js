import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';

let stompClient = null;
let connected = false;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;

const socketUrl = 'http://localhost:8080/ws';

export function connectWebSocket(onOrderStatusUpdate) {
    const socket = new SockJS(socketUrl, null, {
        transports: ['websocket', 'xhr-streaming', 'xhr-polling'],
        withCredentials: true
    });

    stompClient = Stomp.over(socket);

    stompClient.reconnect_delay = 5000; // 5 saniyede reconnect
    stompClient.debug = () => {}; // 🚀 Fix burada: boş fonksiyon

    stompClient.connect({}, onConnected(onOrderStatusUpdate), onError);
}

function onConnected(onOrderStatusUpdate) {
    return () => {
        console.log('✅ WebSocket connected!');
        connected = true;
        reconnectAttempts = 0;

        stompClient.subscribe('/user/queue/order-status', (message) => {
            const updatedOrder = JSON.parse(message.body); // 🔥 Gelen mesajı JSON parse etmeyi unutma

            if (onOrderStatusUpdate) {
                onOrderStatusUpdate(updatedOrder);
            }
        });
    };
}

function onError(error) {
    console.error('❌ WebSocket error:', error);
    connected = false;

    if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
        reconnectAttempts++;
        console.log(`🔄 Reconnecting attempt ${reconnectAttempts}...`);
        setTimeout(() => {
            connectWebSocket();
        }, 5000);
    } else {
        console.log('🛑 Max reconnect attempts reached.');
    }
}

export function sendOrderStatusUpdate(orderId, newStatus) {
    if (stompClient && connected) {
        const dto = {
            orderId: orderId,
            newStatus: newStatus
        };
        stompClient.send('/app/updateOrderStatus', {}, JSON.stringify(dto));
        console.log('📤 Order status update sent:', dto);
    } else {
        console.error('❌ WebSocket is not connected. Cannot send message.');
    }
}

export function disconnectWebSocket() {
    if (stompClient !== null) {
        stompClient.disconnect(() => {
            console.log('🚪 WebSocket disconnected');
        });
        connected = false;
    }
}

export function isWebSocketConnected() {
    return connected;
}
