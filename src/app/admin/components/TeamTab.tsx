"use client";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useLanguage } from "@/shared/i18n/LanguageContext";
import { getTeamMembers, addTeamMember, updateTeamMember, deleteTeamMember } from "@/shared/api/teamApi";
import type { TeamMember } from "@/shared/api/teamApi";
import { modalService } from "@/shared/ui/Modal/modalService";
import { handleMainImageUpload } from "./imageUploadUtils";

type Props = { showToast: (msg: string, type?: 'success' | 'error') => void };

export default function TeamTab({ showToast }: Props) {
  const { t } = useLanguage();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => { loadTeam(); }, []);

  const loadTeam = async () => {
    try { setTeamMembers(await getTeamMembers()); } catch (e) { console.error(e); }
  };

  const openAddForm = () => { setEditingItem(null); setIsFormOpen(true); };
  const openEditForm = (item: any) => { setEditingItem(item); setIsFormOpen(true); };
  const closeForm = () => { setEditingItem(null); setIsFormOpen(false); };

  const handleDelete = async (id: string) => {
    if (!(await modalService.confirm("", t.admin.confirmDel))) return;
    try { await deleteTeamMember(id); await loadTeam(); }
    catch (e) { console.error(e); await modalService.alert("", t.admin.errDel); }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.target as HTMLFormElement);
    const data = Object.fromEntries(formData.entries()) as any;
    try {
      const teamData = {
        name: data.title, role: data.description,
        imageUrl: data.imageUrl, sortOrder: Number(data.sortOrder) || 0,
      };
      if (editingItem) await updateTeamMember(editingItem.id, teamData);
      else await addTeamMember(teamData);
      await loadTeam();
      showToast(t.admin.itemSaved, 'success');
      if (!editingItem) closeForm();
    } catch (e) {
      console.error(e); await modalService.alert('', t.admin.errSave);
    } finally { setIsSubmitting(false); }
  };

  return (
    <>
      {isFormOpen && (
        <div className="card border-0 p-4 mb-4" style={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h3 className="h5 fw-bold mb-0" style={{ color: 'var(--color-text)' }}>{editingItem ? t.admin.modeEdit : t.admin.modeAdd}</h3>
            <button type="button" className="btn-close" onClick={closeForm}></button>
          </div>
          <form onSubmit={handleSave}>
            <div className="row g-3">
              <div className="col-md-12">
                <label className="form-label">{t.admin.teamName}</label>
                <input type="text" name="title" className="form-control" required defaultValue={editingItem?.name || ''} />
              </div>
              <div className="col-md-12">
                <label className="form-label">{t.admin.teamRole}</label>
                <textarea name="description" className="form-control" rows={3} required defaultValue={editingItem?.role || ''}></textarea>
              </div>
              <div className="col-md-6">
                <label className="form-label">{t.admin.teamOrder}</label>
                <input type="number" name="sortOrder" className="form-control" defaultValue={editingItem?.sortOrder || 0} />
              </div>
              <div className="col-md-6">
                <label className="form-label">{t.admin.formImageUrl} <span className="text-danger">*</span></label>
                <div className="d-flex gap-2">
                  <input type="text" id="mainImageUrlInput" name="imageUrl" className="form-control" required defaultValue={editingItem?.imageUrl || ''} />
                  <label className="btn btn-outline-secondary text-nowrap d-flex align-items-center" style={{ cursor: 'pointer' }}>
                    <i className="bi bi-upload me-2"></i>{t.admin.formFromPc}
                    <input type="file" accept="image/*" className="d-none" onChange={(e) => handleMainImageUpload(e, t.admin.uploading)} />
                  </label>
                </div>
              </div>
              <div className="col-12 mt-4">
                <button type="submit" className="btn px-4 rounded-pill" style={{ backgroundColor: 'var(--color-primary)', color: '#fff', border: 'none' }} disabled={isSubmitting}>
                  {isSubmitting ? t.admin.formSaving : t.admin.formSave}
                </button>
                <button type="button" className="btn ms-2 px-4 rounded-pill" style={{ border: '1px solid var(--color-border)', color: 'var(--color-text)', backgroundColor: 'transparent' }} onClick={closeForm}>
                  {t.admin.formCancel}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {!isFormOpen && (
        <section className="card border-0 p-4" style={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h3 className="h5 fw-bold mb-0" style={{ color: 'var(--color-text)' }}>{t.admin.teamTitle}</h3>
            <button className="btn btn-sm px-3 rounded-pill" style={{ backgroundColor: 'var(--color-primary)', color: '#fff', border: 'none' }} onClick={openAddForm}>
              <i className="bi bi-plus-lg me-1"></i>{t.admin.addBtn}
            </button>
          </div>
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th style={{ width: '50px' }}>#</th>
                  <th style={{ width: '60px' }}></th>
                  <th>{t.admin.teamName}</th>
                  <th>{t.admin.teamRole}</th>
                  <th className="text-end">{t.admin.colActions}</th>
                </tr>
              </thead>
              <tbody>
                {teamMembers.map((member, idx) => (
                  <tr key={member.id}>
                    <td>{idx + 1}</td>
                    <td>
                      {member.imageUrl ? (
                        <Image src={member.imageUrl} width={40} height={40} alt={member.name} style={{ objectFit: 'cover', borderRadius: '50%' }} />
                      ) : (
                        <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px', backgroundColor: 'var(--color-primary)', color: '#fff', fontWeight: 600 }}>
                          {member.name[0]}
                        </div>
                      )}
                    </td>
                    <td className="fw-bold">{member.name}</td>
                    <td style={{ color: 'var(--color-text-muted)' }}>{member.role}</td>
                    <td className="text-end">
                      <button className="btn btn-sm btn-outline-secondary rounded-pill me-1" onClick={() => openEditForm(member)}>
                        <i className="bi bi-pencil me-1"></i>{t.admin.btnEdit}
                      </button>
                      <button className="btn btn-sm btn-outline-danger rounded-pill" onClick={() => handleDelete(member.id)}>
                        <i className="bi bi-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))}
                {teamMembers.length === 0 && (
                  <tr><td colSpan={5} className="text-center py-4" style={{ color: 'var(--color-text-muted)' }}>{t.admin.teamNoData}</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </>
  );
}
