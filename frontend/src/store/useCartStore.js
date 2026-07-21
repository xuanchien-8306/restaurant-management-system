import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useCartStore = create(
    persist(
        (set, get) => ({
            cart: [],
            addToCart: (product) => {
                const cart = get().cart;
                const existingItem = cart.find(item => item.id === product.id);
                if (existingItem) {
                    set({
                        cart: cart.map(item =>
                            item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                        )
                    });
                } else {
                    set({ cart: [...cart, { ...product, quantity: 1, note: '' }] });
                }
            },
            removeItem: (id) => set({ cart: get().cart.filter(item => item.id !== id) }),
            increase: (id) => {
                set({
                    cart: get().cart.map(item =>
                        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
                    )
                });
            },
            decrease: (id) => {
                set({
                    cart: get().cart.map(item =>
                        item.id === id && item.quantity > 1 ? { ...item, quantity: item.quantity - 1 } : item
                    )
                });
            },
            updateQuantity: (id, quantity) => {
                if (quantity < 1) quantity = 1;
                set({
                    cart: get().cart.map(item =>
                        item.id === id ? { ...item, quantity: quantity } : item
                    )
                });
            },
            updateNote: (id, note) => {
                set({
                    cart: get().cart.map(item =>
                        item.id === id ? { ...item, note: note } : item
                    )
                });
            },
            clearCart: () => set({ cart: [] }),
            getTotalPrice: () => get().cart.reduce((total, item) => total + (item.price * item.quantity), 0),
            getTotalQuantity: () => get().cart.reduce((total, item) => total + item.quantity, 0),
        }),
        { name: 'cart-storage' }
    )
);

export default useCartStore;