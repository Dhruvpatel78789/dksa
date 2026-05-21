"use client";

import { useEffect, useMemo, useState } from "react";
import { getOptimizedMediaUrl } from "@/lib/media";

type Review = {
  _id: string;
  name?: string | null;
  review?: string | null;
  product?: string | null;
  type: "text" | "image" | "video";
  mediaUrl?: string | null;
  isSelectedForHome?: boolean;
  createdAt?: string;
};

type ProductSize = {
  size: string;
  qty: string;
};

type Ingredient = {
  name: string;
  imageUrl: string;
  file?: File | null;
};

type Product = {
  _id: string;
  name: string;
  description: string;
  howToUse: string;
  photos: string[];
  price?: number;
  discountPercentage?: number;
  ingredients: {
    name: string;
    imageUrl: string;
  }[];
  sizes: {
    size: string;
    qty: number;
  }[];
  isPromoted?: boolean;
  promoDescription?: string;
};

type Order = {
  _id: string;
  userName?: string;
  userEmail?: string;
  address?: {
    phone?: string;
    fullName?: string;
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    pincode?: string;
  };
  items: {
    name: string;
    quantity: number;
    size?: string;
  }[];
  total: number;
  discountCode?: string;
  paymentStatus: "pending" | "confirmed" | "rejected";
  orderStatus:
    | "created"
    | "ordered"
    | "shipping"
    | "out_for_delivery"
    | "delivered"
    | "cancelled";
  shipment?: {
    courierName?: string;
    trackingId?: string;
    trackingUrl?: string;
    note?: string;
  };
  createdAt?: string;
  updatedAt?: string;
  payuPaymentId?: string;
  paymentType?: string;
  bankReferenceNumber?: string;
};

type AdminTab =
  | "add"
  | "manage"
  | "product"
  | "promotion"
  | "discounts"
  | "orders";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>("add");

  const [type, setType] = useState<"text" | "image" | "video">("text");
  const [name, setName] = useState("");
  const [review, setReview] = useState("");
  const [product, setProduct] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const [reviews, setReviews] = useState<Review[]>([]);
  const [selectedMap, setSelectedMap] = useState<Record<string, boolean>>({});

  const [filterProduct, setFilterProduct] = useState("");
  const [charLimit, setCharLimit] = useState("");

  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);

  const [productName, setProductName] = useState("");
  const [productCategory, setProductCategory] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [productHowToUse, setProductHowToUse] = useState("");
  const [productPhotoFiles, setProductPhotoFiles] = useState<File[]>([]);
  const [productPrice, setProductPrice] = useState("");
  const [productDiscountPercentage, setProductDiscountPercentage] =
    useState("");
  const [sizes, setSizes] = useState<ProductSize[]>([{ size: "", qty: "" }]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { name: "", imageUrl: "", file: null },
  ]);

  const [products, setProducts] = useState<Product[]>([]);
  const [promotionMap, setPromotionMap] = useState<Record<string, boolean>>({});
  const [promoDescriptionMap, setPromoDescriptionMap] = useState<
    Record<string, string>
  >({});
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);

  const [orderSearch, setOrderSearch] = useState("");
  const [orderDate, setOrderDate] = useState("");
  const [orderPaymentStatus, setOrderPaymentStatus] = useState("all");
  const [orderStatusFilter, setOrderStatusFilter] = useState("all");
  const [openShipmentOrderId, setOpenShipmentOrderId] = useState<string | null>(
    null
  );

  const [couponCode, setCouponCode] = useState("");
  const [couponDiscountType, setCouponDiscountType] = useState<
    "percentage" | "fixed"
  >("percentage");
  const [couponDiscountValue, setCouponDiscountValue] = useState("");
  const [couponAppliesTo, setCouponAppliesTo] = useState<"all" | "selected">(
    "all"
  );
  const [couponProductIds, setCouponProductIds] = useState<string[]>([]);
  const [couponStartsAt, setCouponStartsAt] = useState("");
  const [couponEndsAt, setCouponEndsAt] = useState("");
  

  const [toast, setToast] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  function showToast(type: "success" | "error", text: string) {
    setToast({ type, text });

    setTimeout(() => {
      setToast(null);
    }, 3000);
  }

  async function uploadFile(fileToUpload: File, folder: string) {
    const formData = new FormData();
    formData.append("file", fileToUpload);
    formData.append("folder", folder);

    const uploadRes = await fetch("/api/admin/upload", {
      method: "POST",
      body: formData,
    });

    const uploadData = await uploadRes.json();

    if (!uploadRes.ok || uploadData.error) {
      throw new Error(uploadData.error || "Upload failed.");
    }

    return uploadData.url as string;
  }

  async function loadReviews() {
    setIsLoadingReviews(true);

    try {
      const res = await fetch("/api/admin/reviews");
      const data = await res.json();

      const reviewsData: Review[] = data.reviews || [];
      setReviews(reviewsData);

      const map: Record<string, boolean> = {};
      reviewsData.forEach((item) => {
        map[item._id] = item.isSelectedForHome || false;
      });

      setSelectedMap(map);
    } finally {
      setIsLoadingReviews(false);
    }
  }

  async function loadProducts() {
    setIsLoadingProducts(true);

    try {
      const res = await fetch("/api/admin/products");
      const data = await res.json();

      const productsData: Product[] = data.products || [];
      setProducts(productsData);

      const promoMap: Record<string, boolean> = {};
      const descriptionMap: Record<string, string> = {};

      productsData.forEach((item) => {
        promoMap[item._id] = item.isPromoted || false;
        descriptionMap[item._id] = item.promoDescription || "";
      });

      setPromotionMap(promoMap);
      setPromoDescriptionMap(descriptionMap);
    } finally {
      setIsLoadingProducts(false);
    }
  }
  async function loadOrders() {
    setIsLoadingOrders(true);

    try {
      const res = await fetch("/api/admin/orders");
      const data = await res.json();

      if (!res.ok) {
        showToast("error", data.error || "Failed to load orders.");
        return;
      }

      setOrders(data.orders || []);
    } finally {
      setIsLoadingOrders(false);
    }
  }

  useEffect(() => {
    loadReviews();
    loadProducts();
    loadOrders();
  }, []);

  const selectedCount = useMemo(() => {
    return Object.values(selectedMap).filter(Boolean).length;
  }, [selectedMap]);

  const filteredReviews = useMemo(() => {
    return reviews.filter((item) => {
      const productMatch =
        !filterProduct ||
        (item.product || "")
          .toLowerCase()
          .includes(filterProduct.toLowerCase());

      const charMatch =
        !charLimit || (item.review || "").length <= Number(charLimit);

      return productMatch && charMatch;
    });
  }, [reviews, filterProduct, charLimit]);

  async function submitReview() {
    setMessage("");

    if (type === "text") {
      if (!name.trim() || !review.trim()) {
        showToast("error", "Name and review are required for text review.");
        return;
      }
    }

    if ((type === "image" || type === "video") && !file) {
      showToast("error", "Please upload a media file.");
      return;
    }

    setIsSaving(true);

    try {
      let mediaUrl = "";

      if (type !== "text" && file) {
        mediaUrl = await uploadFile(file, "reviews");
      }

      const res = await fetch("/api/admin/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type,
          name,
          review,
          product,
          mediaUrl,
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        showToast("error", data.error || "Failed to add review.");
        return;
      }

      setName("");
      setReview("");
      setProduct("");
      setFile(null);
      setType("text");
      showToast("success", "Review added successfully.");

      await loadReviews();
    } finally {
      setIsSaving(false);
    }
  }

  async function submitProduct() {
    if (!productName.trim()) {
      showToast("error", "Product name is required.");
      return;
    }
    if (!productCategory.trim()) {
      showToast("error", "Product category is required.");
      return;
    }

    if (!productDescription.trim()) {
      showToast("error", "Product description is required.");
      return;
    }

    if (!productHowToUse.trim()) {
      showToast("error", "How to use is required.");
      return;
    }

    if (!productPrice.trim() || Number(productPrice) <= 0) {
      showToast("error", "Valid product price is required.");
      return;
    }

    if (
      productDiscountPercentage &&
      (Number(productDiscountPercentage) < 0 ||
        Number(productDiscountPercentage) > 100)
    ) {
      showToast("error", "Discount must be between 0 and 100.");
      return;
    }

    if (productPhotoFiles.length === 0) {
      showToast("error", "At least one product photo is required.");
      return;
    }

    const cleanSizes = sizes
      .map((item) => ({
        size: item.size.trim(),
        qty: Number(item.qty),
      }))
      .filter((item) => item.size);

    if (cleanSizes.length === 0) {
      showToast("error", "At least one product size is required.");
      return;
    }

    if (cleanSizes.some((item) => Number.isNaN(item.qty) || item.qty < 0)) {
      showToast("error", "Each size must have valid quantity.");
      return;
    }

    setIsSaving(true);

    try {
      const photoUrls: string[] = [];

      for (const photo of productPhotoFiles) {
        const url = await uploadFile(photo, "products");
        photoUrls.push(url);
      }

      const uploadedIngredients = [];

      for (const ingredient of ingredients) {
        const cleanName = ingredient.name.trim();

        if (!cleanName && !ingredient.file) continue;

        let imageUrl = ingredient.imageUrl;

        if (ingredient.file) {
          imageUrl = await uploadFile(ingredient.file, "ingredients");
        }

        uploadedIngredients.push({
          name: cleanName,
          imageUrl,
        });
      }

      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: productName,
          category: productCategory,
          description: productDescription,
          howToUse: productHowToUse,
          photos: photoUrls,
          price: Number(productPrice),
          discountPercentage: Number(productDiscountPercentage || 0),
          ingredients: uploadedIngredients,
          sizes: cleanSizes,
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        showToast("error", data.error || "Failed to add product.");
        return;
      }

      setProductName("");
      setProductCategory("");
      setProductDescription("");
      setProductHowToUse("");
      setProductPhotoFiles([]);
      setProductPrice("");
      setProductDiscountPercentage("");
      setSizes([{ size: "", qty: "" }]);
      setIngredients([{ name: "", imageUrl: "", file: null }]);

      showToast("success", "Product added successfully.");

      await loadProducts();
    } catch (error) {
      showToast(
        "error",
        error instanceof Error ? error.message : "Failed to add product."
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function savePromotionSelection() {
    setIsSaving(true);

    try {
      const productIds = Object.keys(promotionMap);

      for (const id of productIds) {
        const res = await fetch(`/api/admin/products/${id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            isPromoted: promotionMap[id] || false,
            promoDescription: promoDescriptionMap[id] || "",
          }),
        });

        const data = await res.json();

        if (!res.ok || data.error) {
          showToast("error", data.error || "Failed to save promotion.");
          return;
        }
      }

      showToast("success", "Promotions saved successfully.");
      await loadProducts();
    } finally {
      setIsSaving(false);
    }
  }

  async function saveHomeSelection() {
    const selectedIds = Object.keys(selectedMap).filter((id) => selectedMap[id]);

    if (selectedIds.length > 10) {
      showToast("error", "Maximum 10 reviews can be selected for home page.");
      return;
    }

    setIsSaving(true);
    setMessage("");

    try {
      const res = await fetch("/api/admin/reviews/select", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ selectedIds }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        showToast("error", data.error || "Failed to save selection.");
        return;
      }

      showToast("success", "Home page selection saved.");
      await loadReviews();
    } finally {
      setIsSaving(false);
    }
  }

  async function createCoupon() {
    if (!couponCode.trim()) {
      showToast("error", "Coupon code is required.");
      return;
    }

    if (!couponDiscountValue.trim() || Number(couponDiscountValue) <= 0) {
      showToast("error", "Valid discount value is required.");
      return;
    }

    if (
      couponDiscountType === "percentage" &&
      Number(couponDiscountValue) > 100
    ) {
      showToast("error", "Percentage discount cannot exceed 100.");
      return;
    }

    if (couponAppliesTo === "selected" && couponProductIds.length === 0) {
      showToast("error", "Select at least one product for this coupon.");
      return;
    }

    setIsSaving(true);

    try {
      const res = await fetch("/api/admin/discounts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: couponCode,
          discountType: couponDiscountType,
          discountValue: Number(couponDiscountValue),
          appliesTo: couponAppliesTo,
          productIds: couponProductIds,
          startsAt: couponStartsAt,
          endsAt: couponEndsAt,
          isActive: true,
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        showToast("error", data.error || "Failed to create coupon.");
        return;
      }

      setCouponCode("");
      setCouponDiscountType("percentage");
      setCouponDiscountValue("");
      setCouponAppliesTo("all");
      setCouponProductIds([]);
      setCouponStartsAt("");
      setCouponEndsAt("");

      showToast("success", "Coupon created successfully.");
    } finally {
      setIsSaving(false);
    }
  }

  async function updateOrder(
    orderId: string,
    payload: {
      paymentStatus?: Order["paymentStatus"];
      orderStatus?: Order["orderStatus"];
      shipment?: {
        courierName?: string;
        trackingId?: string;
        trackingUrl?: string;
        note?: string;
      };
    }
  ) {
    setIsSaving(true);

    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        showToast("error", data.error || "Failed to update order.");
        return;
      }

      showToast("success", "Order updated.");
      await loadOrders();
    } finally {
      setIsSaving(false);
    }
  }

  const filteredOrders = useMemo(() => {
  return orders.filter((order) => {
    const search = orderSearch.toLowerCase().trim();

    const productNames = order.items
      .map((item) => item.name)
      .join(" ")
      .toLowerCase();

    const courierName = order.shipment?.courierName?.toLowerCase() || "";
    const paymentId = order.payuPaymentId?.toLowerCase() || "";
    const paymentType = order.paymentType?.toLowerCase() || "";
    const bankReferenceNumber =
      order.bankReferenceNumber?.toLowerCase() || "";

    const searchMatch =
      !search ||
      (order.userName || "").toLowerCase().includes(search) ||
      (order.userEmail || "").toLowerCase().includes(search) ||
      (order.address?.phone || "").toLowerCase().includes(search) ||
      productNames.includes(search) ||
      courierName.includes(search) ||
      paymentId.includes(search) ||
      paymentType.includes(search) ||
      bankReferenceNumber.includes(search);

    const dateMatch =
      !orderDate ||
      (order.createdAt &&
        new Date(order.createdAt).toISOString().slice(0, 10) === orderDate);

    const paymentMatch =
      orderPaymentStatus === "all" ||
      order.paymentStatus === orderPaymentStatus;

    const statusMatch =
      orderStatusFilter === "all" || order.orderStatus === orderStatusFilter;

    return searchMatch && dateMatch && paymentMatch && statusMatch;
  });
}, [
  orders,
  orderSearch,
  orderDate,
  orderPaymentStatus,
  orderStatusFilter,
]);

  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "#F7EFE7",
        fontFamily: "Arial, sans-serif",
        color: "#1F2933",
        display: "grid",
        gridTemplateColumns: "280px 1fr",
      }}
    >
      {toast && (
        <div
          style={{
            position: "fixed",
            top: "24px",
            right: "24px",
            zIndex: 9999,
            padding: "14px 18px",
            borderRadius: "14px",
            color: "white",
            backgroundColor:
              toast.type === "success" ? "#3A5A40" : "#9B2C2C",
            boxShadow: "0 12px 28px rgba(0,0,0,0.18)",
            fontWeight: 700,
          }}
        >
          {toast.text}
        </div>
      )}

      <aside
        style={{
          minHeight: "100vh",
          position: "sticky",
          top: 0,
          padding: "32px 22px",
          backgroundColor: "#2F3E2F",
          color: "#FFFFFF",
        }}
      >
        <p
          style={{
            margin: 0,
            opacity: 0.7,
            fontSize: "13px",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
          }}
        >
          Dashboard
        </p>

        <h1
          style={{
            margin: "8px 0 34px",
            fontSize: "30px",
            lineHeight: 1,
            letterSpacing: "-0.04em",
          }}
        >
          Admin Panel
        </h1>

        <nav style={{ display: "grid", gap: "10px" }}>
          {[
            { id: "add", label: "Add Review" },
            { id: "manage", label: "Home Reviews" },
            { id: "product", label: "Add Product" },
            { id: "promotion", label: "Promotions" },
            { id: "discounts", label: "Discount Coupons" },
            { id: "orders", label: "Orders" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as AdminTab)}
              style={{
                width: "100%",
                padding: "14px 16px",
                borderRadius: "16px",
                border: "none",
                cursor: "pointer",
                textAlign: "left",
                backgroundColor:
                  activeTab === tab.id ? "#FFE5D4" : "rgba(255,255,255,0.08)",
                color: activeTab === tab.id ? "#2F3E2F" : "#FFFFFF",
                fontWeight: 800,
                fontSize: "15px",
              }}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </aside>

      <section style={{ padding: "40px" }}>
        <div style={{ maxWidth: "1180px", margin: "0 auto" }}>
          {message && (
            <div
              style={{
                marginBottom: "24px",
                backgroundColor: "#FFFFFF",
                border: "1px solid #E1D8CE",
                padding: "14px 16px",
                borderRadius: "14px",
                color: "#3A5A40",
                fontWeight: 600,
              }}
            >
              {message}
            </div>
          )}

          {activeTab === "add" && (
            <section style={cardStyle}>
              <h2 style={{ marginTop: 0 }}>Add Review</h2>

              <label style={labelStyle}>Review Type</label>
              <div
                style={{ display: "flex", gap: "12px", marginBottom: "24px" }}
              >
                {(["text", "image", "video"] as const).map((item) => (
                  <button
                    key={item}
                    onClick={() => {
                      setType(item);
                      setName("");
                      setReview("");
                      setFile(null);
                    }}
                    style={{
                      padding: "12px 18px",
                      borderRadius: "14px",
                      border: "1px solid #D8CDC2",
                      backgroundColor: type === item ? "#3A5A40" : "#FAF7F2",
                      color: type === item ? "#FFFFFF" : "#2F3E2F",
                      cursor: "pointer",
                      textTransform: "capitalize",
                      fontWeight: 700,
                    }}
                  >
                    {item}
                  </button>
                ))}
              </div>

              {type === "text" && (
                <div style={formGridStyle}>
                  <div>
                    <label style={labelStyle}>Name</label>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Customer name"
                      style={inputStyle}
                    />
                  </div>

                  <div>
                    <label style={labelStyle}>Product optional</label>
                    <input
                      value={product}
                      onChange={(e) => setProduct(e.target.value)}
                      placeholder="Product name"
                      style={inputStyle}
                    />
                  </div>

                  <div style={{ gridColumn: "1 / -1" }}>
                    <label style={labelStyle}>Review</label>
                    <textarea
                      value={review}
                      onChange={(e) => setReview(e.target.value)}
                      placeholder="Write review text"
                      style={{
                        ...inputStyle,
                        minHeight: "140px",
                        resize: "vertical",
                      }}
                    />
                  </div>
                </div>
              )}

              {(type === "image" || type === "video") && (
                <div style={formGridStyle}>
                  <div>
                    <label style={labelStyle}>
                      {type === "image" ? "Image" : "Video"} File
                    </label>
                    <input
                      type="file"
                      accept={type === "image" ? "image/*" : "video/*"}
                      onChange={(e) => {
                        if (e.target.files) setFile(e.target.files[0]);
                      }}
                      style={inputStyle}
                    />
                  </div>

                  <div>
                    <label style={labelStyle}>Product optional</label>
                    <input
                      value={product}
                      onChange={(e) => setProduct(e.target.value)}
                      placeholder="Product name"
                      style={inputStyle}
                    />
                  </div>
                </div>
              )}

              <button
                onClick={submitReview}
                disabled={isSaving}
                style={primaryButtonStyle(isSaving)}
              >
                {isSaving ? "Saving..." : "Add Review"}
              </button>
            </section>
          )}

          {activeTab === "product" && (
            <section style={cardStyle}>
              <h2 style={{ marginTop: 0 }}>Add Product</h2>

              <div style={formGridStyle}>
                <div>
                  <label style={labelStyle}>Product Name</label>
                  <input
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    placeholder="Root Revival Serum"
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={labelStyle}>Category</label>
                  <input
                    value={productCategory || ""}
                    onChange={(e) => setProductCategory(e.target.value)}
                    placeholder="serum, shampoo, mask"
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={labelStyle}>Product Photos</label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => {
                      setProductPhotoFiles(Array.from(e.target.files || []));
                    }}
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={labelStyle}>Price</label>
                  <input
                    value={productPrice || ""}
                    onChange={(e) => setProductPrice(e.target.value)}
                    placeholder="1299"
                    type="number"
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={labelStyle}>Discount %</label>
                  <input
                    value={productDiscountPercentage || ""}
                    onChange={(e) =>
                      setProductDiscountPercentage(e.target.value)
                    }
                    placeholder="10"
                    type="number"
                    style={inputStyle}
                  />
                </div>

                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={labelStyle}>Description</label>
                  <textarea
                    value={productDescription}
                    onChange={(e) => setProductDescription(e.target.value)}
                    placeholder="Short product description"
                    style={{
                      ...inputStyle,
                      minHeight: "110px",
                      resize: "vertical",
                    }}
                  />
                </div>

                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={labelStyle}>How to Use</label>
                  <textarea
                    value={productHowToUse}
                    onChange={(e) => setProductHowToUse(e.target.value)}
                    placeholder="Explain how to use this product"
                    style={{
                      ...inputStyle,
                      minHeight: "110px",
                      resize: "vertical",
                    }}
                  />
                </div>
              </div>

              <div style={{ marginTop: "28px" }}>
                <div style={sectionHeaderStyle}>
                  <h3 style={{ margin: 0 }}>Available Sizes</h3>
                  <button
                    onClick={() =>
                      setSizes((prev) => [...prev, { size: "", qty: "" }])
                    }
                    style={smallButtonStyle}
                  >
                    + Add Size
                  </button>
                </div>

                <div style={{ display: "grid", gap: "12px" }}>
                  {sizes.map((item, index) => (
                    <div key={index} style={rowGridStyle}>
                      <input
                        value={item.size}
                        onChange={(e) => {
                          const value = e.target.value;
                          setSizes((prev) =>
                            prev.map((sizeItem, sizeIndex) =>
                              sizeIndex === index
                                ? { ...sizeItem, size: value }
                                : sizeItem
                            )
                          );
                        }}
                        placeholder="Size e.g. 100 ml"
                        style={inputStyle}
                      />

                      <input
                        value={item.qty}
                        onChange={(e) => {
                          const value = e.target.value;
                          setSizes((prev) =>
                            prev.map((sizeItem, sizeIndex) =>
                              sizeIndex === index
                                ? { ...sizeItem, qty: value }
                                : sizeItem
                            )
                          );
                        }}
                        placeholder="Qty"
                        type="number"
                        style={inputStyle}
                      />

                      <button
                        onClick={() => {
                          setSizes((prev) =>
                            prev.filter((_, sizeIndex) => sizeIndex !== index)
                          );
                        }}
                        style={dangerButtonStyle}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ marginTop: "28px" }}>
                <div style={sectionHeaderStyle}>
                  <h3 style={{ margin: 0 }}>Ingredients</h3>
                  <button
                    onClick={() =>
                      setIngredients((prev) => [
                        ...prev,
                        { name: "", imageUrl: "", file: null },
                      ])
                    }
                    style={smallButtonStyle}
                  >
                    + Add Ingredient
                  </button>
                </div>

                <div style={{ display: "grid", gap: "12px" }}>
                  {ingredients.map((item, index) => (
                    <div key={index} style={ingredientGridStyle}>
                      <input
                        value={item.name}
                        onChange={(e) => {
                          const value = e.target.value;
                          setIngredients((prev) =>
                            prev.map((ingredient, ingredientIndex) =>
                              ingredientIndex === index
                                ? { ...ingredient, name: value }
                                : ingredient
                            )
                          );
                        }}
                        placeholder="Ingredient name"
                        style={inputStyle}
                      />

                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const selectedFile = e.target.files?.[0] || null;
                          setIngredients((prev) =>
                            prev.map((ingredient, ingredientIndex) =>
                              ingredientIndex === index
                                ? { ...ingredient, file: selectedFile }
                                : ingredient
                            )
                          );
                        }}
                        style={inputStyle}
                      />

                      <button
                        onClick={() => {
                          setIngredients((prev) =>
                            prev.filter(
                              (_, ingredientIndex) => ingredientIndex !== index
                            )
                          );
                        }}
                        style={dangerButtonStyle}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={submitProduct}
                disabled={isSaving}
                style={primaryButtonStyle(isSaving)}
              >
                {isSaving ? "Saving Product..." : "Add Product"}
              </button>
            </section>
          )}

          {activeTab === "promotion" && (
            <section style={cardStyle}>
              <div style={topRowStyle}>
                <div>
                  <h2 style={{ margin: 0 }}>Promotion Products</h2>
                  <p style={{ margin: "6px 0 0", color: "#6B705C" }}>
                    Select products and add short descriptions for the homepage
                    promotion section.
                  </p>
                </div>

                <button
                  onClick={savePromotionSelection}
                  disabled={isSaving}
                  style={primaryButtonStyle(isSaving)}
                >
                  {isSaving ? "Saving..." : "Save Promotions"}
                </button>
              </div>

              {isLoadingProducts ? (
                <p>Loading products...</p>
              ) : products.length === 0 ? (
                <p>No products added yet.</p>
              ) : (
                <div style={cardGridStyle}>
                  {products.map((item) => {
                    const image = item.photos?.[0] || "";

                    return (
                      <article key={item._id} style={miniCardStyle}>
                        {image && (
                          <img
                            src={image}
                            alt={item.name}
                            style={productImageStyle}
                          />
                        )}

                        <div style={spaceBetweenStyle}>
                          <h3 style={{ margin: 0 }}>{item.name}</h3>

                          <label style={checkboxLabelStyle}>
                            <input
                              type="checkbox"
                              checked={promotionMap[item._id] || false}
                              onChange={(e) => {
                                const checked = e.target.checked;

                                setPromotionMap((prev) => ({
                                  ...prev,
                                  [item._id]: checked,
                                }));
                              }}
                            />
                            Promote
                          </label>
                        </div>

                        <p style={mutedParagraphStyle}>{item.description}</p>

                        <label style={labelStyle}>Promotion Description</label>
                        <textarea
                          value={promoDescriptionMap[item._id] || ""}
                          onChange={(e) => {
                            const value = e.target.value;

                            setPromoDescriptionMap((prev) => ({
                              ...prev,
                              [item._id]: value,
                            }));
                          }}
                          placeholder="Short homepage promotion description"
                          style={{
                            ...inputStyle,
                            minHeight: "90px",
                            resize: "vertical",
                          }}
                        />
                      </article>
                    );
                  })}
                </div>
              )}
            </section>
          )}

          {activeTab === "discounts" && (
            <section style={cardStyle}>
              <h2 style={{ marginTop: 0 }}>Create Discount Coupon</h2>

              <div style={formGridStyle}>
                <div>
                  <label style={labelStyle}>Coupon Code</label>
                  <input
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="WELCOME10"
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={labelStyle}>Discount Type</label>
                  <select
                    value={couponDiscountType}
                    onChange={(e) =>
                      setCouponDiscountType(
                        e.target.value as "percentage" | "fixed"
                      )
                    }
                    style={inputStyle}
                  >
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed Amount</option>
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>Discount Value</label>
                  <input
                    value={couponDiscountValue}
                    onChange={(e) => setCouponDiscountValue(e.target.value)}
                    placeholder="10"
                    type="number"
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={labelStyle}>Apply To</label>
                  <select
                    value={couponAppliesTo}
                    onChange={(e) =>
                      setCouponAppliesTo(e.target.value as "all" | "selected")
                    }
                    style={inputStyle}
                  >
                    <option value="all">All Products</option>
                    <option value="selected">Selected Products</option>
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>Start Date</label>
                  <input
                    type="datetime-local"
                    value={couponStartsAt}
                    onChange={(e) => setCouponStartsAt(e.target.value)}
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={labelStyle}>End Date</label>
                  <input
                    type="datetime-local"
                    value={couponEndsAt}
                    onChange={(e) => setCouponEndsAt(e.target.value)}
                    style={inputStyle}
                  />
                </div>
              </div>

              {couponAppliesTo === "selected" && (
                <div style={{ marginTop: "26px" }}>
                  <h3>Select Products</h3>

                  {isLoadingProducts ? (
                    <p>Loading products...</p>
                  ) : (
                    <div style={cardGridStyle}>
                      {products.map((item) => {
                        const checked = couponProductIds.includes(item._id);

                        return (
                          <label key={item._id} style={miniCardStyle}>
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setCouponProductIds((prev) => [
                                    ...prev,
                                    item._id,
                                  ]);
                                } else {
                                  setCouponProductIds((prev) =>
                                    prev.filter((id) => id !== item._id)
                                  );
                                }
                              }}
                            />

                            <strong>{item.name}</strong>
                            <p style={mutedParagraphStyle}>
                              ₹{item.price || 0}
                            </p>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              <button
                onClick={createCoupon}
                disabled={isSaving}
                style={primaryButtonStyle(isSaving)}
              >
                {isSaving ? "Creating..." : "Create Coupon"}
              </button>
            </section>
          )}

          {activeTab === "orders" && (
  <section style={cardStyle}>
    <div style={topRowStyle}>
      <div>
        <h2 style={{ margin: 0 }}>Orders</h2>
        <p style={{ margin: "6px 0 0", color: "#6B705C" }}>
          Search and manage complete order history.
        </p>
      </div>

      <button onClick={loadOrders} style={smallButtonStyle}>
        Refresh
      </button>
    </div>

    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1.4fr 180px 180px 180px",
        gap: "12px",
        marginBottom: "22px",
      }}
    >
      <input
        value={orderSearch}
        onChange={(e) => setOrderSearch(e.target.value)}
        placeholder="Search name, email, phone, product, courier"
        style={inputStyle}
      />

      <input
        type="date"
        value={orderDate}
        onChange={(e) => setOrderDate(e.target.value)}
        style={inputStyle}
      />

      <select
        value={orderPaymentStatus}
        onChange={(e) => setOrderPaymentStatus(e.target.value)}
        style={inputStyle}
      >
        <option value="all">All payments</option>
        <option value="pending">Pending</option>
        <option value="confirmed">Confirmed</option>
        <option value="rejected">Rejected</option>
      </select>

      <select
        value={orderStatusFilter}
        onChange={(e) => setOrderStatusFilter(e.target.value)}
        style={inputStyle}
      >
        <option value="all">All statuses</option>
        <option value="created">Created</option>
        <option value="ordered">Ordered</option>
        <option value="shipping">Shipping</option>
        <option value="out_for_delivery">Out For Delivery</option>
        <option value="delivered">Delivered</option>
        <option value="cancelled">Cancelled</option>
      </select>
    </div>

    {isLoadingOrders ? (
      <p>Loading orders...</p>
    ) : filteredOrders.length === 0 ? (
      <p>No orders found.</p>
    ) : (
      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "separate",
            borderSpacing: "0 12px",
            minWidth: "1180px",
          }}
        >
          <thead>
            <tr style={{ textAlign: "left", color: "#6B705C" }}>
              <th style={thStyle}>Customer</th>
              <th style={thStyle}>Products</th>
              <th style={thStyle}>Amount</th>
              <th style={thStyle}>Discount</th>
              <th style={thStyle}>Payment</th>
              <th style={thStyle}>Payment Type</th>
              <th style={thStyle}>Payment ID</th>
              <th style={thStyle}>Order Status</th>
              <th style={thStyle}>Shipment</th>
              <th style={thStyle}>Date</th>
            </tr>
          </thead>

          <tbody>
            {filteredOrders.map((order) => (
              <tr
                key={order._id}
                style={{
                  backgroundColor: "#FAF7F2",
                  boxShadow: "0 10px 24px rgba(0,0,0,0.05)",
                }}
              >
                <td style={tdStyle}>
                  <strong>{order.userName || "Customer"}</strong>
                  <p style={tableSubTextStyle}>{order.userEmail || "No email"}</p>
                  <p style={tableSubTextStyle}>
                    {order.address?.phone || "No phone"}
                  </p>
                </td>

                <td style={tdStyle}>
                  {order.items.map((item, index) => (
                    <p key={index} style={{ margin: "0 0 6px" }}>
                      {item.name} × {item.quantity}
                      {item.size ? ` (${item.size})` : ""}
                    </p>
                  ))}
                </td>

                <td style={tdStyle}>
                  <strong>₹{Math.round(order.total || 0)}</strong>
                </td>

                <td style={tdStyle}>
                  {order.discountCode || "—"}
                </td>

                <td style={tdStyle}>
                  <select
                    value={order.paymentStatus}
                    onChange={(e) =>
                      updateOrder(order._id, {
                        paymentStatus: e.target.value as Order["paymentStatus"],
                      })
                    }
                    style={statusSelectStyle(order.paymentStatus)}
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </td>

                <td style={tdStyle}>
                  {order.paymentType || "—"}
                </td>

                <td style={tdStyle}>
                  <p style={{ margin: 0 }}>
                    {order.payuPaymentId || "—"}
                  </p>

                  {order.bankReferenceNumber && (
                    <p style={tableSubTextStyle}>
                      Bank Ref: {order.bankReferenceNumber}
                    </p>
                  )}
                </td>

                <td style={tdStyle}>
                  <select
                    value={order.orderStatus}
                    onChange={(e) =>
                      updateOrder(order._id, {
                        orderStatus: e.target.value as Order["orderStatus"],
                      })
                    }
                    style={statusSelectStyle(order.orderStatus)}
                  >
                    <option value="created">Created</option>
                    <option value="ordered">Ordered</option>
                    <option value="shipping">Shipping</option>
                    <option value="out_for_delivery">Out For Delivery</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </td>

                <td style={tdStyle}>
                  <button
                    disabled={order.paymentStatus !== "confirmed"}
                    onClick={() => {
                      if (order.paymentStatus !== "confirmed") return;

                      setOpenShipmentOrderId(
                        openShipmentOrderId === order._id ? null : order._id
                      );
                    }}
                    style={{
                      ...smallButtonStyle,
                      opacity: order.paymentStatus === "confirmed" ? 1 : 0.45,
                      cursor:
                        order.paymentStatus === "confirmed" ? "pointer" : "not-allowed",
                    }}
                  >
                    Shipment
                  </button>

                  {openShipmentOrderId === order._id && (
                    <div
                      style={{
                        marginTop: 12,
                        display: "grid",
                        gap: 10,
                        minWidth: 260,
                      }}
                    >
                      <input
                        defaultValue={order.shipment?.courierName || ""}
                        placeholder="Courier name"
                        style={inputStyle}
                        id={`courier-${order._id}`}
                      />

                      <input
                        defaultValue={order.shipment?.trackingId || ""}
                        placeholder="Tracking ID"
                        style={inputStyle}
                        id={`tracking-${order._id}`}
                      />

                      <input
                        defaultValue={order.shipment?.trackingUrl || ""}
                        placeholder="Tracking URL"
                        style={inputStyle}
                        id={`tracking-url-${order._id}`}
                      />

                      <input
                        defaultValue={order.shipment?.note || ""}
                        placeholder="Shipment note"
                        style={inputStyle}
                        id={`shipment-note-${order._id}`}
                      />

                      <button
                        style={smallButtonStyle}
                        onClick={() => {
                          const courierInput = document.getElementById(
                            `courier-${order._id}`
                          ) as HTMLInputElement | null;

                          const trackingInput = document.getElementById(
                            `tracking-${order._id}`
                          ) as HTMLInputElement | null;

                          const trackingUrlInput = document.getElementById(
                            `tracking-url-${order._id}`
                          ) as HTMLInputElement | null;

                          const noteInput = document.getElementById(
                            `shipment-note-${order._id}`
                          ) as HTMLInputElement | null;

                          updateOrder(order._id, {
                            shipment: {
                              courierName: courierInput?.value || "",
                              trackingId: trackingInput?.value || "",
                              trackingUrl: trackingUrlInput?.value || "",
                              note: noteInput?.value || "",
                            },
                          });

                          setOpenShipmentOrderId(null);
                        }}
                      >
                        Save Shipment
                      </button>
                    </div>
                  )}
                </td>

                <td style={tdStyle}>
                  {order.createdAt
                    ? new Date(order.createdAt).toLocaleString()
                    : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </section>
)}

          {activeTab === "manage" && (
            <section style={cardStyle}>
              <div style={topRowStyle}>
                <div>
                  <h2 style={{ margin: 0 }}>Home Reviews</h2>
                  <p style={{ margin: "6px 0 0", color: "#6B705C" }}>
                    Selected: {selectedCount}/10
                  </p>
                </div>

                <button
                  onClick={saveHomeSelection}
                  disabled={isSaving}
                  style={primaryButtonStyle(isSaving)}
                >
                  {isSaving ? "Saving..." : "Save Changes"}
                </button>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 220px",
                  gap: "16px",
                  marginBottom: "24px",
                }}
              >
                <input
                  value={filterProduct}
                  onChange={(e) => setFilterProduct(e.target.value)}
                  placeholder="Filter by product"
                  style={inputStyle}
                />

                <input
                  value={charLimit}
                  onChange={(e) => setCharLimit(e.target.value)}
                  placeholder="Max characters"
                  type="number"
                  style={inputStyle}
                />
              </div>

              {isLoadingReviews ? (
                <p>Loading reviews...</p>
              ) : (
                <div style={cardGridStyle}>
                  {filteredReviews.map((item) => {
                    const mediaUrl =
                      item.type === "image" || item.type === "video"
                        ? getOptimizedMediaUrl(item.mediaUrl || "", item.type)
                        : "";

                    return (
                      <article key={item._id} style={miniCardStyle}>
                        <div style={spaceBetweenStyle}>
                          <span
                            style={{
                              padding: "6px 10px",
                              borderRadius: "999px",
                              backgroundColor: "#E9DED2",
                              color: "#3A5A40",
                              fontWeight: 700,
                              textTransform: "capitalize",
                              fontSize: "13px",
                            }}
                          >
                            {item.type}
                          </span>

                          <label style={checkboxLabelStyle}>
                            <input
                              type="checkbox"
                              checked={selectedMap[item._id] || false}
                              onChange={(e) => {
                                const checked = e.target.checked;

                                if (checked && selectedCount >= 10) {
                                  showToast(
                                    "error",
                                    "Maximum 10 reviews allowed."
                                  );
                                  return;
                                }

                                setSelectedMap((prev) => ({
                                  ...prev,
                                  [item._id]: checked,
                                }));
                              }}
                            />
                            Home
                          </label>
                        </div>

                        {item.type === "image" && item.mediaUrl && (
                          <img
                            src={mediaUrl}
                            alt="Review media"
                            style={adminMediaStyle}
                          />
                        )}

                        {item.type === "video" && item.mediaUrl && (
                          <video
                            src={mediaUrl}
                            muted
                            controls
                            style={adminMediaStyle}
                          />
                        )}

                        {item.type === "text" && (
                          <>
                            <h3 style={{ margin: "0 0 8px" }}>
                              {item.name || "Unnamed"}
                            </h3>
                            <p
                              style={{
                                margin: 0,
                                color: "#3B3B3B",
                                lineHeight: 1.6,
                              }}
                            >
                              {item.review}
                            </p>
                          </>
                        )}

                        {item.product && (
                          <p
                            style={{
                              marginTop: "14px",
                              color: "#6B705C",
                              fontSize: "14px",
                            }}
                          >
                            Product: {item.product}
                          </p>
                        )}
                      </article>
                    );
                  })}
                </div>
              )}
            </section>
          )}
        </div>
      </section>
    </main>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block",
  marginBottom: "8px",
  color: "#3A5A40",
  fontWeight: 700,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "13px 14px",
  borderRadius: "14px",
  border: "1px solid #D8CDC2",
  outline: "none",
  fontSize: "15px",
  backgroundColor: "#FFFFFF",
  boxSizing: "border-box",
};

const formGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: "18px",
};

const cardStyle: React.CSSProperties = {
  backgroundColor: "#FFFFFF",
  borderRadius: "24px",
  padding: "28px",
  boxShadow: "0 18px 40px rgba(0,0,0,0.08)",
};

const sectionHeaderStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "16px",
  marginBottom: "14px",
};

const rowGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 160px 110px",
  gap: "12px",
};

const ingredientGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr 110px",
  gap: "12px",
};

const adminMediaStyle: React.CSSProperties = {
  width: "100%",
  height: "180px",
  objectFit: "cover",
  borderRadius: "14px",
  marginBottom: "14px",
};

const productImageStyle: React.CSSProperties = {
  width: "100%",
  height: "180px",
  objectFit: "cover",
  borderRadius: "14px",
  marginBottom: "14px",
};

const topRowStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: "20px",
  alignItems: "center",
  marginBottom: "24px",
};

const spaceBetweenStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: "12px",
  alignItems: "center",
  marginBottom: "12px",
};

const checkboxLabelStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  cursor: "pointer",
  fontWeight: 700,
  whiteSpace: "nowrap",
};

const mutedParagraphStyle: React.CSSProperties = {
  margin: "0 0 14px",
  color: "#6B705C",
  lineHeight: 1.5,
  fontSize: "14px",
};

const cardGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
  gap: "18px",
};

const miniCardStyle: React.CSSProperties = {
  border: "1px solid #E5DDD4",
  borderRadius: "18px",
  padding: "18px",
  backgroundColor: "#FAF7F2",
};

const smallButtonStyle: React.CSSProperties = {
  padding: "10px 14px",
  borderRadius: "12px",
  border: "none",
  backgroundColor: "#3A5A40",
  color: "#FFFFFF",
  cursor: "pointer",
  fontWeight: 800,
};

const dangerButtonStyle: React.CSSProperties = {
  padding: "10px 14px",
  borderRadius: "12px",
  border: "none",
  backgroundColor: "#9B2C2C",
  color: "#FFFFFF",
  cursor: "pointer",
  fontWeight: 800,
};

const thStyle: React.CSSProperties = {
  padding: "12px 14px",
  fontSize: "13px",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
};

const tdStyle: React.CSSProperties = {
  padding: "16px 14px",
  verticalAlign: "top",
  borderTop: "1px solid #E5DDD4",
  borderBottom: "1px solid #E5DDD4",
};

const tableSubTextStyle: React.CSSProperties = {
  margin: "6px 0 0",
  color: "#6B705C",
  fontSize: "13px",
};

function statusSelectStyle(status: string): React.CSSProperties {
  const isGood =
    status === "confirmed" ||
    status === "ordered" ||
    status === "delivered";

  const isBad =
    status === "rejected" ||
    status === "cancelled";

  return {
    border: "none",
    borderRadius: "999px",
    padding: "10px 14px",
    fontWeight: 900,
    cursor: "pointer",
    backgroundColor: isGood ? "#DDEFD8" : isBad ? "#F5D5D5" : "#FFF1CC",
    color: isGood ? "#2F3E2F" : isBad ? "#8A1F1F" : "#6B4E00",
  };
}

function primaryButtonStyle(isSaving: boolean): React.CSSProperties {
  return {
    marginTop: "26px",
    padding: "14px 24px",
    borderRadius: "14px",
    border: "none",
    backgroundColor: "#3A5A40",
    color: "#FFFFFF",
    opacity: isSaving ? 0.6 : 1,
    cursor: isSaving ? "not-allowed" : "pointer",
    fontWeight: 800,
    fontSize: "15px",
  };
}