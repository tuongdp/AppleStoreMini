import { useState } from "react";
import { useTranslation } from "@/i18n/useTranslation";
import { Plus, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import AddressCard from "./AddressCard";
import AddressForm from "./AddressForm";
import EmptyState from "@/components/shared/EmptyState";
import {
  useGetAddressesQuery,
  useDeleteAddressMutation,
  useSetDefaultAddressMutation,
} from "@/store/api/usersApi";
import { toast } from "sonner";

export default function AddressBook() {
  const { t } = useTranslation("profile");
  const [formOpen, setFormOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);

  const { data, isLoading } = useGetAddressesQuery();
  const [deleteAddress, { isLoading: isDeleting }] = useDeleteAddressMutation();
  const [setDefault, { isLoading: isSettingDefault }] =
    useSetDefaultAddressMutation();

  // ✅ getAddressesQuery transformResponse → response.data trực tiếp (array)
  const addresses = Array.isArray(data) ? data : [];

  const handleAdd = () => {
    setEditingAddress(null);
    setFormOpen(true);
  };

  const handleEdit = (address) => {
    setEditingAddress(address);
    setFormOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await deleteAddress(id).unwrap();
      toast.success(t("address.deleteSuccess"));
    } catch (err) {
      toast.error(err?.data?.message || t("status.error", { ns: "common" }));
    }
  };

  const handleSetDefault = async (id) => {
    try {
      await setDefault(id).unwrap();
      toast.success(t("address.setDefaultSuccess"));
    } catch (err) {
      toast.error(err?.data?.message || t("status.error", { ns: "common" }));
    }
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setEditingAddress(null);
  };

  if (isLoading) return <AddressBookSkeleton />;

  return (
    <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-foreground">
            {t("address.title")}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("address.subtitle")}
          </p>
        </div>
        <Button
          size="sm"
          className="shrink-0 rounded-full"
          onClick={handleAdd}
          disabled={addresses.length >= 5}
        >
          <Plus className="mr-1.5 h-4 w-4" />
          {t("address.addNew")}
        </Button>
      </div>

      {addresses.length >= 5 && (
        <p className="mb-4 text-xs text-muted-foreground">
          {t("address.maxAddress")}
        </p>
      )}

      <Separator className="mb-6" />

      {formOpen && (
        <div className="mb-6">
          <AddressForm address={editingAddress} onClose={handleFormClose} />
          <Separator className="mt-6" />
        </div>
      )}

      {addresses.length === 0 && !formOpen ? (
        <EmptyState
          icon={MapPin}
          title={t("address.empty")}
          description={t("address.emptyDesc")}
          actionLabel={t("address.addNew")}
          onAction={handleAdd}
        />
      ) : (
        <div className="space-y-4">
          {addresses.map((address) => (
            // ✅ MySQL integer id thuần — không có _id
            <AddressCard
              key={address.id}
              address={address}
              onEdit={() => handleEdit(address)}
              onDelete={() => handleDelete(address.id)}
              onSetDefault={() => handleSetDefault(address.id)}
              isDeleting={isDeleting}
              isSettingDefault={isSettingDefault}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function AddressBookSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
      <div className="mb-6 flex items-start justify-between">
        <div className="space-y-2">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-56" />
        </div>
        <Skeleton className="h-9 w-32 rounded-full" />
      </div>
      <Skeleton className="mb-6 h-px w-full" />
      <div className="space-y-4">
        {[...Array(2)].map((_, i) => (
          <Skeleton key={i} className="h-28 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}
