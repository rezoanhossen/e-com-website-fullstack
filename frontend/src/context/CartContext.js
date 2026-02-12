import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback
} from "react";
import axios from "axios";
import { AuthContext } from "./AuthContext";

export const CartContext = createContext();

const GUEST_CART_KEY = "guestCart";

export const CartProvider = ({ children }) => {
  const { token, user } = useContext(AuthContext);

  const [cart, setCart] = useState({ items: [], totalPrice: 0 });
  const [loading, setLoading] = useState(false);
  const [migrated, setMigrated] = useState(false);

  /* --------------------------------
     Axios Config
  -------------------------------- */
  const getAxiosConfig = useCallback(() => {
    return {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };
  }, [token]);

  /* --------------------------------
     Save Guest Cart
  -------------------------------- */
  const saveGuestCart = (cartData) => {
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cartData));
  };

  /* --------------------------------
     Load Cart
  -------------------------------- */
  const loadCart = useCallback(async () => {
    try {
      setLoading(true);

      // Logged In User
      if (token) {
        const response = await axios.get("/api/cart", getAxiosConfig());

        const cartData = response.data.cart || response.data;

        setCart(cartData);
      }

      // Guest User
      else {
        const guestCart = localStorage.getItem(GUEST_CART_KEY);

        if (guestCart) {
          setCart(JSON.parse(guestCart));
        } else {
          setCart({ items: [], totalPrice: 0 });
        }
      }
    } catch (error) {
      console.error("Load cart error:", error);
    } finally {
      setLoading(false);
    }
  }, [token, getAxiosConfig]);

  /* --------------------------------
     Migrate Guest → User Cart
  -------------------------------- */
  const migrateGuestCartToUser = useCallback(async () => {
    try {
      const guestCart = localStorage.getItem(GUEST_CART_KEY);

      if (!guestCart) return;

      const guestData = JSON.parse(guestCart);

      if (!guestData.items || guestData.items.length === 0) return;

      console.log("Migrating guest cart:", guestData);

      for (const item of guestData.items) {
        const productId =
          typeof item.productId === "object"
            ? item.productId._id
            : item.productId;

        await axios.post(
          "/api/cart/add",
          {
            productId,
            quantity: item.quantity
          },
          getAxiosConfig()
        );
      }

      localStorage.removeItem(GUEST_CART_KEY);

      console.log("Guest cart migrated");

    } catch (error) {
      console.error("Migration error:", error);
    }
  }, [getAxiosConfig]);

  /* --------------------------------
     Initial Load
  -------------------------------- */
  useEffect(() => {
    loadCart();
  }, [loadCart]);

  /* --------------------------------
     Sync After Login
  -------------------------------- */
  useEffect(() => {
    const syncCart = async () => {
      if (token && user && !migrated) {
        await migrateGuestCartToUser();
        await loadCart();
        setMigrated(true);
      }
    };

    syncCart();
  }, [token, user, migrated, migrateGuestCartToUser, loadCart]);

  /* --------------------------------
     Add To Cart
  -------------------------------- */
  const addToCart = async (productId, quantity = 1, productDetails = {}) => {
    try {
      setLoading(true);

      // Logged In
      if (token) {
        const response = await axios.post(
          "/api/cart/add",
          { productId, quantity },
          getAxiosConfig()
        );

        const cartData = response.data.cart || response.data;

        setCart(cartData);
      }

      // Guest
      else {
        const newCart = { ...cart };

        const existing = newCart.items.find(
          (item) =>
            item.productId === productId ||
            item.productId?._id === productId
        );

        if (existing) {
          existing.quantity += quantity;
        } else {
          newCart.items.push({
            productId: productDetails._id ? productDetails : productId,
            quantity,
            price: productDetails.price || 0
          });
        }

        newCart.totalPrice = newCart.items.reduce((sum, item) => {
          const price =
            item.price || item.productId?.price || 0;

          return sum + price * item.quantity;
        }, 0);

        setCart(newCart);
        saveGuestCart(newCart);
      }

      return { success: true };

    } catch (error) {
      console.error("Add to cart error:", error);

      return {
        success: false,
        message: error.response?.data?.message || "Add to cart failed"
      };
    } finally {
      setLoading(false);
    }
  };

  /* --------------------------------
     Update Cart
  -------------------------------- */
  const updateCartItem = async (productId, quantity) => {
    try {
      setLoading(true);

      if (token) {
        const response = await axios.put(
          "/api/cart/update",
          { productId, quantity },
          getAxiosConfig()
        );

        const cartData = response.data.cart || response.data;

        setCart(cartData);
      } else {
        const newCart = { ...cart };

        const item = newCart.items.find(
          (i) =>
            i.productId === productId ||
            i.productId?._id === productId
        );

        if (!item) return;

        if (quantity === 0) {
          newCart.items = newCart.items.filter(
            (i) =>
              i.productId !== productId &&
              i.productId?._id !== productId
          );
        } else {
          item.quantity = quantity;
        }

        newCart.totalPrice = newCart.items.reduce((sum, item) => {
          const price =
            item.price || item.productId?.price || 0;

          return sum + price * item.quantity;
        }, 0);

        setCart(newCart);
        saveGuestCart(newCart);
      }

      return { success: true };

    } catch (error) {
      console.error("Update cart error:", error);

      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  /* --------------------------------
     Remove Item
  -------------------------------- */
  const removeFromCart = async (productId) => {
    try {
      setLoading(true);

      if (token) {
        const response = await axios.delete(
          `/api/cart/remove/${productId}`,
          getAxiosConfig()
        );

        const cartData = response.data.cart || response.data;

        setCart(cartData);
      } else {
        const newCart = { ...cart };

        newCart.items = newCart.items.filter(
          (item) =>
            item.productId !== productId &&
            item.productId?._id !== productId
        );

        newCart.totalPrice = newCart.items.reduce((sum, item) => {
          const price =
            item.price || item.productId?.price || 0;

          return sum + price * item.quantity;
        }, 0);

        setCart(newCart);
        saveGuestCart(newCart);
      }

      return { success: true };

    } catch (error) {
      console.error("Remove error:", error);

      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  /* --------------------------------
     Clear Cart
  -------------------------------- */
  const clearCart = async () => {
    try {
      setLoading(true);

      if (token) {
        const response = await axios.delete(
          "/api/cart/clear",
          getAxiosConfig()
        );

        const cartData = response.data.cart || response.data;

        setCart(cartData);
      } else {
        setCart({ items: [], totalPrice: 0 });
        localStorage.removeItem(GUEST_CART_KEY);
      }

      return { success: true };

    } catch (error) {
      console.error("Clear cart error:", error);

      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  /* --------------------------------
     Cart Count
  -------------------------------- */
  const getCartCount = () => {
    return cart.items.reduce(
      (total, item) => total + item.quantity,
      0
    );
  };

  /* --------------------------------
     Provider
  -------------------------------- */
  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        addToCart,
        updateCartItem,
        removeFromCart,
        clearCart,
        getCartCount,
        loadCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
