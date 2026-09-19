import React, { useState, useMemo } from "react";
import type { LabourContract } from "../types";
import { ConfirmDeleteModal } from "../components/ConfirmDeleteModal";
import { SearchableExpenseSelect } from "../components/SearchableExpenseSelect";
import { TableFormPopover } from "../components/TableFormPopover";
import {
  DateInput,
  isValidDate,
  formatToDDMMYYYY,
  compareByDateDesc,
} from "../components/DateInput";
import {
  HardHat,
  Search,
  Plus,
  Pencil,
  Trash2,
  Phone,
  MapPin,
  ChevronLeft,
  ChevronRight,
  X,
  IndianRupee,
  Wallet,
  Scale,
} from "lucide-react";

interface InteriorLabourContractViewProps {
  contracts: LabourContract[];
  onSelectContract: (contract: LabourContract) => void;
  onAddContract: (
    contractData: Omit<LabourContract, "id" | "sNo">,
  ) => Promise<any> | void;
  onUpdateContract: (updated: LabourContract) => Promise<any> | void;
  onDeleteContract: (id: string) => Promise<any> | void;
  siteOptions?: string[];
}

export const InteriorLabourContractView: React.FC<
  InteriorLabourContractViewProps
> = ({
  contracts,
  onSelectContract,
  onAddContract,
  onUpdateContract,
  onDeleteContract,
  siteOptions = [
    "Palayam",
    "A.R. Rahman Villa - Kitchen",
    "Dr. Vikramaditya Reddy Site",
    "Green Meadows Apt",
  ],
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Add Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const todayStr = new Date().toISOString().split("T")[0];
  const [addDate, setAddDate] = useState(todayStr);
  const [addLabourName, setAddLabourName] = useState("");
  const [addSiteName, setAddSiteName] = useState("");
  const [addLabourCharge, setAddLabourCharge] = useState("45000");
  const [addPhone, setAddPhone] = useState("");

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingContractId, setEditingContractId] = useState<string | null>(
    null,
  );
  const [editDate, setEditDate] = useState("");
  const [editLabourName, setEditLabourName] = useState("");
  const [editSiteName, setEditSiteName] = useState("");
  const [editLabourCharge, setEditLabourCharge] = useState("");
  const [editPhone, setEditPhone] = useState("");

  // Delete Modals
  const [deleteTarget, setDeleteTarget] = useState<LabourContract | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Format Currency
  const formatINR = (val: number) => {
    return "₹" + Number(val || 0).toLocaleString("en-IN");
  };

  // Helper calculations for each contract
  const getContractBalance = (contract: LabourContract) => {
    const charge = Number(contract.labourCharge || 45000);
    const paid = (contract.entries || []).reduce(
      (sum, e) => sum + (Number(e.totalAmount) || 0),
      0,
    );
    return charge - paid;
  };

  // Form Validations
  const isAddFormValid =
    isValidDate(addDate) &&
    addLabourName.trim().length > 0 &&
    addSiteName.trim().length > 0 &&
    parseFloat(addLabourCharge) > 0 &&
    addPhone.trim().length > 0;

  const isEditFormValid =
    isValidDate(editDate) &&
    editLabourName.trim().length > 0 &&
    editSiteName.trim().length > 0 &&
    parseFloat(editLabourCharge) > 0 &&
    editPhone.trim().length > 0;

  // Filter contracts
  const filteredContracts = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    const list = q
      ? contracts.filter(
          (c) =>
            c.labourName.toLowerCase().includes(q) ||
            c.siteName.toLowerCase().includes(q) ||
            c.phone.includes(q) ||
            c.date.includes(q) ||
            formatToDDMMYYYY(c.date).includes(q),
        )
      : contracts;
    return [...list].sort((a, b) =>
      compareByDateDesc(a.date, b.date, a.sNo, b.sNo),
    );
  }, [contracts, searchQuery]);

  // Pagination computations
  const totalPages = Math.ceil(filteredContracts.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(
    startIndex + itemsPerPage,
    filteredContracts.length,
  );
  const paginatedContracts = filteredContracts.slice(startIndex, endIndex);

  const pageNumbers = useMemo(() => {
    const pages: number[] = [];
    if (currentPage > 1) pages.push(currentPage - 1);
    pages.push(currentPage);
    if (currentPage < totalPages) pages.push(currentPage + 1);
    return pages;
  }, [currentPage, totalPages]);

  // Handle Add Submit
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAddFormValid) return;

    await onAddContract({
      date: addDate.trim(),
      labourName: addLabourName.trim(),
      siteName: addSiteName.trim(),
      labourCharge: parseFloat(addLabourCharge) || 45000,
      phone: addPhone.trim(),
      entries: [],
    });

    setAddLabourName("");
    setAddSiteName("");
    setAddLabourCharge("45000");
    setAddPhone("");
    setIsAddModalOpen(false);
    setCurrentPage(1);
  };

  // Open Edit Modal
  const handleOpenEdit = (contract: LabourContract, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingContractId(contract.id);
    setEditDate(contract.date);
    setEditLabourName(contract.labourName);
    setEditSiteName(contract.siteName);
    setEditLabourCharge(String(contract.labourCharge || 45000));
    setEditPhone(contract.phone);
    setIsEditModalOpen(true);
  };

  // Save Edit
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEditFormValid || !editingContractId) return;

    const target = contracts.find((c) => c.id === editingContractId);
    if (target) {
      await onUpdateContract({
        ...target,
        date: editDate.trim(),
        labourName: editLabourName.trim(),
        siteName: editSiteName.trim(),
        labourCharge: parseFloat(editLabourCharge) || 45000,
        phone: editPhone.trim(),
      });
    }

    setIsEditModalOpen(false);
    setEditingContractId(null);
  };

  // Handle Confirm Delete
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await onDeleteContract(deleteTarget.id);
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="w-full">
      {/* LABOUR CONTRACTS LIST */}
      <section className={`afrah-app-table-section w-full${isAddModalOpen ? " with-add-popover" : ""}`}>
        <div className="afrah-app-section-header">
          <div>
            <h1 className="afrah-app-section-title">LABOUR CONTRACTS</h1>
            <span className="afrah-app-section-subtitle">
              {filteredContracts.length}{" "}
              {filteredContracts.length === 1 ? "record" : "records"} · Click a
              row to view ledger & payments
            </span>
          </div>

          <div className="flex-center-10">
            <div className="afrah-app-search-wrapper">
              <Search size={14} className="afrah-app-search-icon" />
              <input
                type="text"
                placeholder="Search labour name, site, phone..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="afrah-app-search-input"
              />
            </div>

            <TableFormPopover
              open={isAddModalOpen}
              onOpenChange={setIsAddModalOpen}
              label="Add Details"
            >
              <form onSubmit={handleAddSubmit} className="afrah-app-add-form">
                <div className="afrah-app-form-group">
                  <label className="afrah-app-label">Date *</label>
                  <DateInput
                    required
                    value={addDate}
                    onChange={setAddDate}
                    className="afrah-app-input"
                  />
                </div>

                <div className="afrah-app-form-group">
                  <label className="afrah-app-label">Labour Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rajesh"
                    value={addLabourName}
                    onChange={(e) => setAddLabourName(e.target.value)}
                    className="afrah-app-input"
                  />
                </div>

                <div className="afrah-app-form-group">
                  <label className="afrah-app-label">
                    Construction Site Name *
                  </label>
                  <SearchableExpenseSelect
                    value={addSiteName}
                    onChange={setAddSiteName}
                    options={siteOptions}
                    placeholder="Search or select site name..."
                    searchPlaceholder="Type to filter or enter site name..."
                    required
                  />
                </div>

                <div className="afrah-app-form-group">
                  <label className="afrah-app-label">
                    Total Amount (Labour Charge) (₹) *
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="e.g. 45000"
                    value={addLabourCharge}
                    onChange={(e) => setAddLabourCharge(e.target.value)}
                    className="afrah-app-input"
                  />
                </div>

                <div className="afrah-app-form-group">
                  <label className="afrah-app-label">Phone *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 97892 91845"
                    value={addPhone}
                    onChange={(e) => setAddPhone(e.target.value)}
                    className="afrah-app-input"
                  />
                </div>

                {!isAddFormValid && (
                  <div className="afrah-app-validation-notice">
                    * All fields are required to enable submission.
                  </div>
                )}

                <div className="afrah-app-add-popover-actions">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="afrah-app-back-btn"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!isAddFormValid}
                    className="btn-theme-primary"
                  >
                    <Plus size={16} />
                    <span>Save Details</span>
                  </button>
                </div>
              </form>
            </TableFormPopover>
          </div>
        </div>

        {/* Table: S.NO, DATE, LABOUR NAME, CONSTRUCTION SITE NAME, PHONE, LABOUR CHARGE, REMAINING AMOUNT, ACTIONS */}
        <div className="afrah-app-table-container">
          <table className="afrah-app-table">
            <thead>
              <tr>
                <th className="text-center" style={{ width: "55px" }}>
                  S.NO
                </th>
                <th style={{ width: "105px" }}>DATE</th>
                <th>LABOUR NAME</th>
                <th>CONSTRUCTION SITE NAME</th>
                <th style={{ width: "140px" }}>PHONE</th>
                <th style={{ width: "135px" }}>LABOUR CHARGE</th>
                <th style={{ width: "140px" }}>REMAINING AMOUNT</th>
                <th className="text-center" style={{ width: "80px" }}>
                  ACTIONS
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedContracts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="empty-state-cell">
                    {searchQuery
                      ? "No matching labour contracts found."
                      : 'No labour contracts added yet. Click "+ Add Details" to create one.'}
                  </td>
                </tr>
              ) : (
                paginatedContracts.map((contract, index) => {
                  const balance = getContractBalance(contract);
                  const charge = Number(contract.labourCharge || 45000);
                  return (
                    <tr
                      key={contract.id}
                      onClick={() => onSelectContract(contract)}
                      className="clickable-client-row"
                    >
                      <td className="cell-sno">{startIndex + index + 1}</td>
                      <td
                        style={{
                          whiteSpace: "nowrap",
                          fontSize: "12px",
                          color: "var(--text-secondary)",
                        }}
                      >
                        {formatToDDMMYYYY(contract.date)}
                      </td>
                      <td>
                        <div className="cell-entity">
                          <div
                            className="afrah-app-user-avatar"
                            style={{
                              background: "rgba(226, 195, 153, 0.15)",
                              color: "var(--primary)",
                            }}
                          >
                            <HardHat size={14} />
                          </div>
                          <span className="row-entity-name">
                            {contract.labourName}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className="cell-icon-text">
                          <MapPin size={13} color="var(--primary)" />
                          <span
                            className="cell-address"
                            style={{ fontWeight: "var(--fw-semibold)" }}
                          >
                            {contract.siteName}
                          </span>
                        </div>
                      </td>
                      <td className="nowrap">
                        <div className="cell-icon-text">
                          <Phone size={13} color="var(--primary)" />
                          <span className="cell-phone">{contract.phone}</span>
                        </div>
                      </td>
                      <td>
                        <strong className="cell-amount">
                          {formatINR(charge)}
                        </strong>
                      </td>
                      <td>
                        <span className="cell-amount">
                          {formatINR(balance)}
                        </span>
                      </td>
                      <td
                        className="text-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="cell-actions">
                          <button
                            onClick={(e) => handleOpenEdit(contract, e)}
                            className="afrah-app-action-btn afrah-app-edit-btn"
                            title="Edit Labour Contract"
                          >
                            <Pencil size={13} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteTarget(contract);
                            }}
                            className="afrah-app-action-btn afrah-app-delete-btn"
                            title="Delete Labour Contract"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {filteredContracts.length > 0 && (
          <div className="afrah-app-pagination-bar">
            <div className="afrah-app-pagination-left">
              <span className="afrah-app-pagination-info">
                Showing <strong>{startIndex + 1}</strong>–
                <strong>{endIndex}</strong> of{" "}
                <strong>{filteredContracts.length}</strong>
              </span>

              <div className="afrah-app-rows-selector">
                <label className="afrah-app-rows-label">Rows per page:</label>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="afrah-app-select-sm"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>

            <div className="afrah-app-pagination-controls">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="afrah-app-page-nav-btn"
                title="Previous Page"
              >
                <ChevronLeft size={16} />
              </button>

              <div className="afrah-app-page-numbers-wrap">
                {pageNumbers.map((p) => (
                  <button
                    key={p}
                    onClick={() => setCurrentPage(p)}
                    className={`afrah-app-page-num-btn ${currentPage === p ? "active" : ""}`}
                  >
                    {p}
                  </button>
                ))}
              </div>

              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                }
                disabled={currentPage === totalPages}
                className="afrah-app-page-nav-btn"
                title="Next Page"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </section>


      {/* Edit Labour Contract Modal */}
      {isEditModalOpen && (
        <div
          className="afrah-app-modal-overlay"
          onClick={() => setIsEditModalOpen(false)}
        >
          <div
            className="afrah-app-modal-container modal-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="afrah-app-modal-header">
              <div className="flex-center">
                <Pencil size={17} color="var(--primary)" />
                <h3 className="afrah-app-modal-title">Edit Labour Contract</h3>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="afrah-app-modal-close-btn"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit}>
              <div className="afrah-app-modal-body">
                <div className="afrah-app-form-group">
                  <label className="afrah-app-label">Date *</label>
                  <DateInput
                    required
                    value={editDate}
                    onChange={setEditDate}
                    className="afrah-app-input"
                  />
                </div>

                <div className="afrah-app-form-group">
                  <label className="afrah-app-label">Labour Name *</label>
                  <input
                    type="text"
                    required
                    value={editLabourName}
                    onChange={(e) => setEditLabourName(e.target.value)}
                    className="afrah-app-input"
                  />
                </div>

                <div className="afrah-app-form-group">
                  <label className="afrah-app-label">
                    Construction Site Name *
                  </label>
                  <SearchableExpenseSelect
                    value={editSiteName}
                    onChange={setEditSiteName}
                    options={siteOptions}
                    placeholder="Search or select site name..."
                    searchPlaceholder="Type to filter or enter site name..."
                    required
                  />
                </div>

                <div className="afrah-app-form-group">
                  <label className="afrah-app-label">
                    Total Amount (Labour Charge) (₹) *
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={editLabourCharge}
                    onChange={(e) => setEditLabourCharge(e.target.value)}
                    className="afrah-app-input"
                  />
                </div>

                <div className="afrah-app-form-group">
                  <label className="afrah-app-label">Phone *</label>
                  <input
                    type="tel"
                    required
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="afrah-app-input"
                  />
                </div>
              </div>

              <div className="afrah-app-modal-footer">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="afrah-app-back-btn"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!isEditFormValid}
                  className="btn-theme-primary"
                >
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      <ConfirmDeleteModal
        isOpen={Boolean(deleteTarget)}
        title="Delete Labour Contract"
        message="Are you sure you want to delete this labour contract record? All associated wage records and work logs will be removed."
        itemName={
          deleteTarget
            ? `${deleteTarget.labourName} (${deleteTarget.siteName})`
            : undefined
        }
        confirmText="Delete Contract"
        isDeleting={isDeleting}
        onConfirm={handleConfirmDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
};
