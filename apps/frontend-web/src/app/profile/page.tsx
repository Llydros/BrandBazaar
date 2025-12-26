"use client";

import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/lib/api";
import { Order, OrderStatus } from "@shared/orders";
import { Address, CreateAddressRequest } from "@shared/addresses";
import { PaymentMethod, CreatePaymentMethodRequest } from "@shared/payment-methods";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

export default function ProfilePage() {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState({ orders: false, addresses: false, paymentMethods: false });
  
  const [addressDialogOpen, setAddressDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<PaymentMethod | null>(null);

  useEffect(() => {
    setMounted(true);
    if (!isLoading && !user) {
      router.push("/");
    }
  }, [isLoading, user, router]);

  useEffect(() => {
    if (activeTab === "orders" && orders.length === 0 && !loading.orders) {
      loadOrders();
    }
    if (activeTab === "addresses" && addresses.length === 0 && !loading.addresses) {
      loadAddresses();
    }
    if (activeTab === "payment-methods" && paymentMethods.length === 0 && !loading.paymentMethods) {
      loadPaymentMethods();
    }
  }, [activeTab]);

  const loadOrders = async () => {
    setLoading(prev => ({ ...prev, orders: true }));
    try {
      const { orders: fetchedOrders } = await api.orders.getMyOrders();
      setOrders(fetchedOrders);
    } catch (error) {
      console.error("Failed to load orders:", error);
    } finally {
      setLoading(prev => ({ ...prev, orders: false }));
    }
  };

  const loadAddresses = async () => {
    setLoading(prev => ({ ...prev, addresses: true }));
    try {
      const { addresses: fetchedAddresses } = await api.addresses.getAll();
      setAddresses(fetchedAddresses);
    } catch (error) {
      console.error("Failed to load addresses:", error);
    } finally {
      setLoading(prev => ({ ...prev, addresses: false }));
    }
  };

  const loadPaymentMethods = async () => {
    setLoading(prev => ({ ...prev, paymentMethods: true }));
    try {
      const { paymentMethods: fetchedPaymentMethods } = await api.paymentMethods.getAll();
      setPaymentMethods(fetchedPaymentMethods);
    } catch (error) {
      console.error("Failed to load payment methods:", error);
    } finally {
      setLoading(prev => ({ ...prev, paymentMethods: false }));
    }
  };

  const formatPrice = (price: number | string) => {
    const numPrice = typeof price === "number" ? price : parseFloat(String(price));
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(numPrice);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (!mounted || isLoading || !user) {
    return (
       <div className="min-h-screen flex items-center justify-center">
         <p className="uppercase tracking-widest animate-pulse">Loading Profile...</p>
       </div>
    );
  }

  return (
    <main className="min-h-screen pt-12 pb-24 container mx-auto px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold uppercase tracking-tighter mb-2">My Account</h1>
        <p className="text-sm text-muted-foreground font-mono">{user.email}</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="rounded-none border-b border-border bg-transparent p-0 h-auto mb-8">
          <TabsTrigger value="overview" className="rounded-none uppercase tracking-wider border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">
            Overview
          </TabsTrigger>
          <TabsTrigger value="orders" className="rounded-none uppercase tracking-wider border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">
            Orders
          </TabsTrigger>
          <TabsTrigger value="addresses" className="rounded-none uppercase tracking-wider border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">
            Addresses
          </TabsTrigger>
          <TabsTrigger value="payment-methods" className="rounded-none uppercase tracking-wider border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">
            Payment Methods
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-0">
          <div className="border border-border p-8 bg-background relative">
            <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-foreground"></div>
            <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-foreground"></div>
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-foreground"></div>
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-foreground"></div>

            <h2 className="text-2xl font-bold uppercase mb-8">Profile Details</h2>
            
            <form className="space-y-6 max-w-md">
              <div className="grid gap-2">
                <Label htmlFor="email" className="uppercase text-xs font-bold">Email Address</Label>
                <Input id="email" value={user.email} disabled className="rounded-none bg-secondary/20" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="role" className="uppercase text-xs font-bold">Account Type</Label>
                <Input id="role" value={user.roles.join(", ")} disabled className="rounded-none bg-secondary/20" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status" className="uppercase text-xs font-bold">Status</Label>
                <Input id="status" value={user.status} disabled className="rounded-none bg-secondary/20 capitalize" />
              </div>
            </form>

            <div className="mt-12 pt-12 border-t border-dashed border-border">
              <h3 className="text-xl font-bold uppercase mb-4">Recent Activity</h3>
              <div className="bg-secondary/10 p-4 font-mono text-sm text-muted-foreground text-center">
                NO RECENT ACTIVITY FOUND
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-dashed border-border">
              <Button 
                variant="outline" 
                className="rounded-none uppercase tracking-wider text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                onClick={() => logout()}
              >
                Logout
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="orders" className="mt-0">
          <OrdersTab 
            orders={orders} 
            loading={loading.orders}
            formatPrice={formatPrice}
            formatDate={formatDate}
          />
        </TabsContent>

        <TabsContent value="addresses" className="mt-0">
          <AddressesTab
            addresses={addresses}
            loading={loading.addresses}
            onRefresh={loadAddresses}
            addressDialogOpen={addressDialogOpen}
            setAddressDialogOpen={setAddressDialogOpen}
            editingAddress={editingAddress}
            setEditingAddress={setEditingAddress}
          />
        </TabsContent>

        <TabsContent value="payment-methods" className="mt-0">
          <PaymentMethodsTab
            paymentMethods={paymentMethods}
            loading={loading.paymentMethods}
            onRefresh={loadPaymentMethods}
            paymentDialogOpen={paymentDialogOpen}
            setPaymentDialogOpen={setPaymentDialogOpen}
            editingPayment={editingPayment}
            setEditingPayment={setEditingPayment}
          />
        </TabsContent>
      </Tabs>
    </main>
  );
}

function OrdersTab({ orders, loading, formatPrice, formatDate }: { 
  orders: Order[]; 
  loading: boolean;
  formatPrice: (price: number | string) => string;
  formatDate: (date: string) => string;
}) {
  if (loading) {
    return (
      <div className="border border-border p-8 bg-background relative">
        <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-foreground"></div>
        <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-foreground"></div>
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-foreground"></div>
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-foreground"></div>
        <div className="bg-secondary/10 p-8 font-mono text-sm text-muted-foreground text-center">
          LOADING ORDERS...
        </div>
      </div>
    );
  }

  return (
    <div className="border border-border p-8 bg-background relative">
      <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-foreground"></div>
      <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-foreground"></div>
      <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-foreground"></div>
      <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-foreground"></div>

      <h2 className="text-2xl font-bold uppercase mb-8">My Orders</h2>
      
      {orders.length === 0 ? (
        <div className="bg-secondary/10 p-8 font-mono text-sm text-muted-foreground text-center">
          NO ORDERS FOUND
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="border border-border p-6 bg-secondary/5">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="font-mono text-xs text-muted-foreground">ORDER #{order.id.slice(0, 8).toUpperCase()}</p>
                  <p className="text-sm text-muted-foreground mt-1">{formatDate(order.createdAt)}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg">{formatPrice(order.totalAmount)}</p>
                  <p className="text-xs uppercase tracking-wider mt-1">{order.status.replace('_', ' ')}</p>
                </div>
              </div>
              {order.items && order.items.length > 0 && (
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-xs uppercase font-bold mb-2">Items ({order.items.length})</p>
                  <div className="space-y-2">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span>{item.productName} x{item.quantity}</span>
                        <span>{formatPrice(Number(item.price) * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AddressesTab({
  addresses,
  loading,
  onRefresh,
  addressDialogOpen,
  setAddressDialogOpen,
  editingAddress,
  setEditingAddress,
}: {
  addresses: Address[];
  loading: boolean;
  onRefresh: () => void;
  addressDialogOpen: boolean;
  setAddressDialogOpen: (open: boolean) => void;
  editingAddress: Address | null;
  setEditingAddress: (address: Address | null) => void;
}) {
  const [formData, setFormData] = useState<CreateAddressRequest>({
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
    label: "",
    isDefault: false,
  });

  useEffect(() => {
    if (editingAddress) {
      setFormData({
        street: editingAddress.street,
        city: editingAddress.city,
        state: editingAddress.state,
        zipCode: editingAddress.zipCode,
        country: editingAddress.country,
        label: editingAddress.label || "",
        isDefault: editingAddress.isDefault,
      });
    } else {
      setFormData({
        street: "",
        city: "",
        state: "",
        zipCode: "",
        country: "",
        label: "",
        isDefault: false,
      });
    }
  }, [editingAddress]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingAddress) {
        await api.addresses.update(editingAddress.id, formData);
      } else {
        await api.addresses.create(formData);
      }
      setAddressDialogOpen(false);
      setEditingAddress(null);
      onRefresh();
    } catch (error) {
      console.error("Failed to save address:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this address?")) {
      try {
        await api.addresses.delete(id);
        onRefresh();
      } catch (error) {
        console.error("Failed to delete address:", error);
      }
    }
  };

  if (loading) {
    return (
      <div className="border border-border p-8 bg-background relative">
        <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-foreground"></div>
        <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-foreground"></div>
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-foreground"></div>
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-foreground"></div>
        <div className="bg-secondary/10 p-8 font-mono text-sm text-muted-foreground text-center">
          LOADING ADDRESSES...
        </div>
      </div>
    );
  }

  return (
    <div className="border border-border p-8 bg-background relative">
      <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-foreground"></div>
      <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-foreground"></div>
      <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-foreground"></div>
      <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-foreground"></div>

      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold uppercase">Addresses</h2>
        <Dialog open={addressDialogOpen} onOpenChange={setAddressDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              variant="outline" 
              className="rounded-none uppercase tracking-wider"
              onClick={() => setEditingAddress(null)}
            >
              Add Address
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="uppercase">{editingAddress ? "Edit Address" : "Add Address"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="label" className="uppercase text-xs font-bold">Label (Optional)</Label>
                <Input
                  id="label"
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  className="rounded-none"
                  placeholder="Home, Work, etc."
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="street" className="uppercase text-xs font-bold">Street</Label>
                <Input
                  id="street"
                  value={formData.street}
                  onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                  className="rounded-none"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="city" className="uppercase text-xs font-bold">City</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="rounded-none"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="state" className="uppercase text-xs font-bold">State</Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="rounded-none"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="zipCode" className="uppercase text-xs font-bold">Zip Code</Label>
                <Input
                  id="zipCode"
                  value={formData.zipCode}
                  onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                  className="rounded-none"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="country" className="uppercase text-xs font-bold">Country</Label>
                <Input
                  id="country"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="rounded-none"
                  required
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={formData.isDefault}
                  onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                  className="rounded-none"
                />
                <Label htmlFor="isDefault" className="uppercase text-xs font-bold">Set as default</Label>
              </div>
              <div className="flex gap-2 pt-4">
                <Button type="submit" className="rounded-none uppercase tracking-wider flex-1">
                  {editingAddress ? "Update" : "Add"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-none uppercase tracking-wider"
                  onClick={() => {
                    setAddressDialogOpen(false);
                    setEditingAddress(null);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {addresses.length === 0 ? (
        <div className="bg-secondary/10 p-8 font-mono text-sm text-muted-foreground text-center">
          NO ADDRESSES FOUND
        </div>
      ) : (
        <div className="space-y-4">
          {addresses.map((address) => (
            <div key={address.id} className="border border-border p-6 bg-secondary/5">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  {address.label && (
                    <p className="font-bold uppercase text-sm mb-1">{address.label}</p>
                  )}
                  {address.isDefault && (
                    <span className="text-xs uppercase tracking-wider text-primary mb-2 inline-block">DEFAULT</span>
                  )}
                  <p className="text-sm">{address.street}</p>
                  <p className="text-sm">{address.city}, {address.state} {address.zipCode}</p>
                  <p className="text-sm">{address.country}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="rounded-none uppercase text-xs"
                    onClick={() => {
                      setEditingAddress(address);
                      setAddressDialogOpen(true);
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="rounded-none uppercase text-xs text-destructive"
                    onClick={() => handleDelete(address.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PaymentMethodsTab({
  paymentMethods,
  loading,
  onRefresh,
  paymentDialogOpen,
  setPaymentDialogOpen,
  editingPayment,
  setEditingPayment,
}: {
  paymentMethods: PaymentMethod[];
  loading: boolean;
  onRefresh: () => void;
  paymentDialogOpen: boolean;
  setPaymentDialogOpen: (open: boolean) => void;
  editingPayment: PaymentMethod | null;
  setEditingPayment: (payment: PaymentMethod | null) => void;
}) {
  const [formData, setFormData] = useState<CreatePaymentMethodRequest>({
    type: "card",
    last4: "",
    brand: "card",
    expiryMonth: undefined,
    expiryYear: undefined,
    holderName: "",
    isDefault: false,
  });
  const [cardNumber, setCardNumber] = useState("");
  const [cvv, setCvv] = useState("");

  useEffect(() => {
    if (editingPayment) {
      setFormData({
        type: editingPayment.type,
        last4: editingPayment.last4,
        brand: editingPayment.brand,
        expiryMonth: editingPayment.expiryMonth || undefined,
        expiryYear: editingPayment.expiryYear || undefined,
        holderName: editingPayment.holderName || "",
        isDefault: editingPayment.isDefault,
      });
      setCardNumber(`**** **** **** ${editingPayment.last4}`);
      setCvv("");
    } else {
      setFormData({
        type: "card",
        last4: "",
        brand: "card",
        expiryMonth: undefined,
        expiryYear: undefined,
        holderName: "",
        isDefault: false,
      });
      setCardNumber("");
      setCvv("");
    }
  }, [editingPayment]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let submitData = { ...formData };
      if (!editingPayment) {
        const cardNumberDigits = cardNumber.replace(/\s/g, "");
        if (cardNumberDigits.length < 4) {
          alert("Please enter a valid card number");
          return;
        }
        submitData.last4 = cardNumberDigits.slice(-4);
      }
      if (editingPayment) {
        await api.paymentMethods.update(editingPayment.id, submitData);
      } else {
        await api.paymentMethods.create(submitData);
      }
      setPaymentDialogOpen(false);
      setEditingPayment(null);
      setCardNumber("");
      setCvv("");
      onRefresh();
    } catch (error) {
      console.error("Failed to save payment method:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this payment method?")) {
      try {
        await api.paymentMethods.delete(id);
        onRefresh();
      } catch (error) {
        console.error("Failed to delete payment method:", error);
      }
    }
  };

  if (loading) {
    return (
      <div className="border border-border p-8 bg-background relative">
        <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-foreground"></div>
        <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-foreground"></div>
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-foreground"></div>
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-foreground"></div>
        <div className="bg-secondary/10 p-8 font-mono text-sm text-muted-foreground text-center">
          LOADING PAYMENT METHODS...
        </div>
      </div>
    );
  }

  return (
    <div className="border border-border p-8 bg-background relative">
      <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-foreground"></div>
      <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-foreground"></div>
      <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-foreground"></div>
      <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-foreground"></div>

      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold uppercase">Payment Methods</h2>
        <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              variant="outline" 
              className="rounded-none uppercase tracking-wider"
              onClick={() => setEditingPayment(null)}
            >
              Add Payment Method
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="uppercase">{editingPayment ? "Edit Payment Method" : "Add Payment Method"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="cardNumber" className="uppercase text-xs font-bold">Card Number</Label>
                <Input
                  id="cardNumber"
                  type="text"
                  value={cardNumber}
                  onChange={(e) => {
                    if (editingPayment) return;
                    const value = e.target.value.replace(/\s/g, "");
                    if (value.length <= 16 && /^\d*$/.test(value)) {
                      const formatted = value.match(/.{1,4}/g)?.join(" ") || value;
                      setCardNumber(formatted);
                    }
                  }}
                  className="rounded-none"
                  placeholder="1234 5678 9012 3456"
                  maxLength={19}
                  required={!editingPayment}
                  disabled={!!editingPayment}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="holderName" className="uppercase text-xs font-bold">Cardholder Name</Label>
                <Input
                  id="holderName"
                  value={formData.holderName}
                  onChange={(e) => setFormData({ ...formData, holderName: e.target.value })}
                  className="rounded-none"
                  placeholder="John Doe"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="expiryMonth" className="uppercase text-xs font-bold">Expiration Month</Label>
                  <Input
                    id="expiryMonth"
                    type="number"
                    min="1"
                    max="12"
                    value={formData.expiryMonth || ""}
                    onChange={(e) => setFormData({ ...formData, expiryMonth: e.target.value ? parseInt(e.target.value) : undefined })}
                    className="rounded-none"
                    placeholder="MM"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="expiryYear" className="uppercase text-xs font-bold">Expiration Year</Label>
                  <Input
                    id="expiryYear"
                    type="number"
                    min="2024"
                    value={formData.expiryYear || ""}
                    onChange={(e) => setFormData({ ...formData, expiryYear: e.target.value ? parseInt(e.target.value) : undefined })}
                    className="rounded-none"
                    placeholder="YYYY"
                    required
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="cvv" className="uppercase text-xs font-bold">CVV</Label>
                <Input
                  id="cvv"
                  type="text"
                  value={cvv}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    if (value.length <= 4) {
                      setCvv(value);
                    }
                  }}
                  className="rounded-none"
                  placeholder="123"
                  maxLength={4}
                  required={!editingPayment}
                  disabled={!!editingPayment}
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={formData.isDefault}
                  onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                  className="rounded-none"
                />
                <Label htmlFor="isDefault" className="uppercase text-xs font-bold">Set as default</Label>
              </div>
              <div className="flex gap-2 pt-4">
                <Button type="submit" className="rounded-none uppercase tracking-wider flex-1">
                  {editingPayment ? "Update" : "Add"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-none uppercase tracking-wider"
                  onClick={() => {
                    setPaymentDialogOpen(false);
                    setEditingPayment(null);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {paymentMethods.length === 0 ? (
        <div className="bg-secondary/10 p-8 font-mono text-sm text-muted-foreground text-center">
          NO PAYMENT METHODS FOUND
        </div>
      ) : (
        <div className="space-y-4">
          {paymentMethods.map((payment) => (
            <div key={payment.id} className="border border-border p-6 bg-secondary/5">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  {payment.isDefault && (
                    <span className="text-xs uppercase tracking-wider text-primary mb-2 inline-block">DEFAULT</span>
                  )}
                  <p className="font-bold uppercase text-sm mb-1">{payment.brand} •••• {payment.last4}</p>
                  {payment.holderName && (
                    <p className="text-sm text-muted-foreground">{payment.holderName}</p>
                  )}
                  {payment.expiryMonth && payment.expiryYear && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Expires {payment.expiryMonth}/{payment.expiryYear}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="rounded-none uppercase text-xs"
                    onClick={() => {
                      setEditingPayment(payment);
                      setPaymentDialogOpen(true);
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="rounded-none uppercase text-xs text-destructive"
                    onClick={() => handleDelete(payment.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
