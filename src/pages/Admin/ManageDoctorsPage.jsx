import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router";
import {
    Search,
    Plus,
    RefreshCw,
    AlertCircle,
    Users,
    Power,
    PowerOff,
} from "lucide-react";
import { adminService } from "../../services/adminService";
import { PageHeader } from "../../components/shared/PageHeader";
import { Card, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Badge } from "../../components/ui/Badge";
import { Table } from "../../components/ui/Table";
import { EmptyState } from "../../components/ui/EmptyState";
import { TableSkeleton } from "../../components/ui/Skeleton";
import {
    showErrorToast,
    showSuccessToast,
} from "../../utils/toastMessageHelper";

const ManageDoctorsPage = () => {
    const navigate = useNavigate();
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [searchQuery, setSearchQuery] = useState("");
    const [togglingId, setTogglingId] = useState(null);
    const [statusFilter, setStatusFilter] = useState("all");
    const [specializationFilter, setSpecializationFilter] = useState("all");
    const [sortOrder, setSortOrder] = useState("name_asc");

    const resetFilters = () => {
        setSearchQuery("");
        setStatusFilter("all");
        setSpecializationFilter("all");
        setSortOrder("name_asc");
    };

    const loadDoctors = async () => {
        try {
            setLoading(true);
            setError("");
            const result = await adminService.getDoctors();

            const payload = result?.data?.doctors
                ? result.data
                : result?.data?.data?.doctors
                  ? result.data.data
                  : result?.doctors
                    ? result
                    : {};

            const list = Array.isArray(payload.doctors)
                ? payload.doctors
                : Array.isArray(result)
                  ? result
                  : [];

            const normalized = list.map((doc) => {
                const name =
                    doc?.name ||
                    doc?.user?.name ||
                    doc?.userName ||
                    doc?.doctor?.name ||
                    "";

                const email =
                    doc?.email || doc?.user?.email || doc?.doctor?.email || "";

                const isActive =
                    typeof doc?.isActive === "boolean"
                        ? doc.isActive
                        : (doc?.status || "").toLowerCase() !== "inactive";

                return {
                    ...doc,
                    _id: doc?._id || doc?.doctorId,
                    doctorId: doc?.doctorId || doc?._id,
                    name,
                    email,
                    specialization:
                        doc?.specialization ||
                        doc?.doctor?.specialization ||
                        "General",
                    consultationFee:
                        doc?.consultationFee ??
                        doc?.doctor?.consultationFee ??
                        0,
                    status: (
                        doc?.status || (isActive ? "active" : "inactive")
                    ).toLowerCase(),
                    isActive,
                };
            });

            setDoctors(normalized);
        } catch (err) {
            setDoctors([]);
            const message =
                err.response?.status === 403
                    ? "Admin access required. Please login with an admin account."
                    : err.response?.data?.message ||
                      "Failed to sync the doctor registry.";
            setError(message);
            showErrorToast(message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDoctors();
    }, []);

    const handleToggleStatus = async (id, currentStatus) => {
        const isCurrentlyActive = currentStatus === "active";
        const action = isCurrentlyActive ? "deactivate" : "activate";

        if (!window.confirm(`Are you sure you want to ${action} this doctor?`))
            return;

        try {
            setTogglingId(id);

            // Map to toggle fallback dynamically if the specification requires specific backend mapping
            if (typeof adminService.toggleDoctorStatus === "function") {
                await adminService.toggleDoctorStatus(id);
            } else if (
                typeof adminService.updateDoctorAvailability === "function"
            ) {
                // Fallback parameter mutation based on my previous adminService inspections
                await adminService.updateDoctorAvailability(id, {
                    status: isCurrentlyActive ? "inactive" : "active",
                });
            } else {
                throw new Error(
                    "Toggle method not explicitly mapped in Service layer",
                );
            }

            showSuccessToast(
                `Doctor successfully ${isCurrentlyActive ? "deactivated" : "activated"}.`,
            );
            await loadDoctors(); // Refresh table entirely natively
        } catch (err) {
            showErrorToast(
                err.response?.data?.message ||
                    err.message ||
                    "Failed to update doctor status.",
            );
        } finally {
            setTogglingId(null);
        }
    };

    const getInitials = (nameStr) => {
        if (!nameStr) return "?";
        return nameStr.charAt(0).toUpperCase();
    };

    const formatDoctorLabel = (rawName) => {
        const name = (rawName || "").trim();
        if (!name) return "Doctor";
        if (/^dr\.?\s/i.test(name)) return name;
        return `Dr. ${name}`;
    };

    const specializationOptions = useMemo(() => {
        const set = new Set();
        doctors.forEach((doc) => {
            const spec = (doc.specialization || "").trim();
            if (spec) set.add(spec);
        });
        return ["all", ...Array.from(set).sort((a, b) => a.localeCompare(b))];
    }, [doctors]);

    // Client-Side Searching Map natively
    const filteredDoctors = useMemo(() => {
        const result = doctors.filter((doc) => {
            const lowerQuery = searchQuery.toLowerCase();
            const nameMatch = (doc.name || "")
                .toLowerCase()
                .includes(lowerQuery);
            const specMatch = (doc.specialization || "")
                .toLowerCase()
                .includes(lowerQuery);

            if (searchQuery && !(nameMatch || specMatch)) return false;

            const statusVal = (
                doc.status || (doc.isActive ? "active" : "inactive")
            ).toLowerCase();
            if (statusFilter !== "all" && statusVal !== statusFilter) {
                return false;
            }

            if (
                specializationFilter !== "all" &&
                (doc.specialization || "") !== specializationFilter
            ) {
                return false;
            }

            return true;
        });

        result.sort((a, b) => {
            if (sortOrder === "name_desc") {
                return (b.name || "").localeCompare(a.name || "");
            }
            if (sortOrder === "fee_high") {
                return (b.consultationFee || 0) - (a.consultationFee || 0);
            }
            if (sortOrder === "fee_low") {
                return (a.consultationFee || 0) - (b.consultationFee || 0);
            }
            return (a.name || "").localeCompare(b.name || "");
        });

        return result;
    }, [doctors, searchQuery, statusFilter, specializationFilter, sortOrder]);

    const hasActiveFilters =
        !!searchQuery ||
        statusFilter !== "all" ||
        specializationFilter !== "all" ||
        sortOrder !== "name_asc";

    // Layout Table Configuration
    const columns = [
        {
            key: "doctorName",
            header: "Name",
            render: (_, doc) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 font-bold flex items-center justify-center shrink-0 border border-primary-200 dark:border-primary-700/40">
                        {getInitials(doc.name)}
                    </div>
                    <div>
                        <p className="font-semibold text-neutral-800 dark:text-neutral-100">
                            {formatDoctorLabel(doc.name)}
                        </p>
                        <p className="text-xs text-neutral-500 font-medium">
                            {doc.email || "No email provided"}
                        </p>
                    </div>
                </div>
            ),
        },
        {
            key: "specialization",
            header: "Specialization",
            render: (_, doc) => (
                <span className="text-neutral-700 dark:text-neutral-300 font-medium">
                    {doc.specialization || "General"}
                </span>
            ),
        },
        {
            key: "experience",
            header: "Experience",
            render: (_, doc) => (
                <span className="text-neutral-600 dark:text-neutral-400">
                    {doc.experience ? `${doc.experience} yrs` : "-"}
                </span>
            ),
        },
        {
            key: "fee",
            header: "Consultation Fee",
            render: (_, doc) => (
                <span className="font-semibold text-success-700">
                    ₹{doc.consultationFee || "0"}
                </span>
            ),
        },
        {
            key: "status",
            header: "Status",
            render: (_, doc) => {
                // Evaluate true status explicitly
                const statusVal =
                    doc.status || (doc.isActive ? "active" : "inactive");
                return (
                    <Badge
                        type="status"
                        value={statusVal === "active" ? "active" : "inactive"}
                    />
                );
            },
        },
        {
            key: "actions",
            header: "Actions",
            className: "text-right",
            render: (_, doc) => {
                const id = doc._id || doc.doctorId;
                const statusVal =
                    doc.status || (doc.isActive ? "active" : "inactive");
                const isActive = statusVal === "active";

                return (
                    <div className="flex justify-end gap-2">
                        <Button
                            size="sm"
                            variant={isActive ? "outline" : "success"}
                            icon={isActive ? PowerOff : Power}
                            onClick={() => handleToggleStatus(id, statusVal)}
                            loading={togglingId === id}
                            className={
                                isActive
                                    ? "text-neutral-500 hover:text-red-600 hover:border-red-200 hover:bg-red-50"
                                    : "shadow-sm"
                            }
                        >
                            {isActive ? "Deactivate" : "Activate"}
                        </Button>
                    </div>
                );
            },
        },
    ];

    // 1. Loading State
    if (loading) {
        return (
            <div className="max-w-7xl mx-auto space-y-6 pb-8">
                <PageHeader
                    title="Manage Doctors"
                    subtitle="Fetching global registry directory..."
                />
                <Card className="p-6">
                    <TableSkeleton rows={8} columns={6} />
                </Card>
            </div>
        );
    }

    // 2. Error State
    if (error && doctors.length === 0) {
        return (
            <div className="max-w-7xl mx-auto py-12">
                <EmptyState
                    icon={AlertCircle}
                    title="Data Synchronization Error"
                    description={error}
                    action={
                        <Button icon={RefreshCw} onClick={loadDoctors}>
                            Retry Fetch
                        </Button>
                    }
                />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6 pb-12 animate-in fade-in">
            <PageHeader
                title="Manage Doctors"
                subtitle={`Total registered practitioners in system: ${doctors.length}`}
                action={
                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            icon={RefreshCw}
                            onClick={loadDoctors}
                        >
                            Refresh
                        </Button>
                        <Button
                            icon={Plus}
                            onClick={() => navigate("/admin/doctors/create")}
                        >
                            Create Doctor
                        </Button>
                    </div>
                }
            />

            <Card className="overflow-hidden shadow-sm border border-neutral-100 dark:border-dark-border min-h-[500px]">
                {/* Controls Panel */}
                <div className="bg-neutral-50/50 dark:bg-dark-elevated/50 p-5 border-b border-neutral-100 dark:border-dark-border flex flex-col md:flex-row justify-between gap-4">
                    <div className="w-full md:w-80">
                        <Input
                            icon={Search}
                            placeholder="Search by name or specialization..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-white shadow-xs focus:ring-primary-500/20"
                        />
                    </div>

                    <div className="flex flex-wrap items-center justify-end gap-2">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="h-10 px-3 rounded-xl border border-neutral-200 dark:border-dark-border bg-white dark:bg-dark-elevated text-sm text-neutral-700 dark:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary-200"
                            aria-label="Filter by status"
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>

                        <select
                            value={specializationFilter}
                            onChange={(e) =>
                                setSpecializationFilter(e.target.value)
                            }
                            className="h-10 px-3 rounded-xl border border-neutral-200 dark:border-dark-border bg-white dark:bg-dark-elevated text-sm text-neutral-700 dark:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary-200"
                            aria-label="Filter by specialization"
                        >
                            {specializationOptions.map((spec) => (
                                <option key={spec} value={spec}>
                                    {spec === "all"
                                        ? "All Specializations"
                                        : spec}
                                </option>
                            ))}
                        </select>

                        <select
                            value={sortOrder}
                            onChange={(e) => setSortOrder(e.target.value)}
                            className="h-10 px-3 rounded-xl border border-neutral-200 dark:border-dark-border bg-white dark:bg-dark-elevated text-sm text-neutral-700 dark:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary-200"
                            aria-label="Sort doctors"
                        >
                            <option value="name_asc">Name (A-Z)</option>
                            <option value="name_desc">Name (Z-A)</option>
                            <option value="fee_high">Fee (High to Low)</option>
                            <option value="fee_low">Fee (Low to High)</option>
                        </select>

                        {hasActiveFilters && (
                            <Button
                                variant="outline"
                                onClick={resetFilters}
                                className="h-10"
                            >
                                Reset Filters
                            </Button>
                        )}

                        <Badge
                            type="info"
                            size="sm"
                            className="bg-primary-50 text-primary-700 border-primary-200 shadow-sm px-3"
                        >
                            {filteredDoctors.length}{" "}
                            {filteredDoctors.length === 1
                                ? "Result"
                                : "Results"}
                        </Badge>
                    </div>
                </div>

                {/* Data Configuration output */}
                <CardContent className="p-0">
                    {filteredDoctors.length === 0 ? (
                        <div className="py-24">
                            <EmptyState
                                icon={Users}
                                title="No doctors located"
                                description={
                                    searchQuery
                                        ? `No practitioners found matching "${searchQuery}".`
                                        : "The registry is currently empty. Start by adding a new doctor."
                                }
                                action={
                                    hasActiveFilters ? (
                                        <Button
                                            variant="outline"
                                            onClick={resetFilters}
                                        >
                                            Reset Filters
                                        </Button>
                                    ) : (
                                        <Button
                                            icon={Plus}
                                            onClick={() =>
                                                navigate(
                                                    "/admin/doctors/create",
                                                )
                                            }
                                        >
                                            Create Account
                                        </Button>
                                    )
                                }
                            />
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <Table
                                columns={columns}
                                data={filteredDoctors}
                                striped
                            />
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export { ManageDoctorsPage };
export default ManageDoctorsPage;
