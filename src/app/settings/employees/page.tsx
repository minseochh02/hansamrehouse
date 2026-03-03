"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";

interface Employee {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  role?: string;
  bankName?: string;
  accountNumber?: string;
  accountHolder?: string;
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newEmployee, setNewEmployee] = useState<Omit<Employee, "id"> & { id?: string }>({
    id: "",
    name: "",
    phone: "",
    email: "",
    role: "",
    bankName: "",
    accountNumber: "",
    accountHolder: "",
  });

  const [filterRole, setFilterRole] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setIsLoading(true);
      const response = await apiFetch("/api/employees");
      if (response.ok) {
        const data = await response.json();
        setEmployees(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Failed to fetch employees:", error);
      setEmployees([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddEmployee = async () => {
    if (!newEmployee.name) return;

    try {
      const method = editingId ? "PATCH" : "POST";
      const body = editingId ? { ...newEmployee, id: editingId } : newEmployee;

      const response = await apiFetch("/api/employees", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        await fetchEmployees();
        setNewEmployee({
          id: "",
          name: "",
          phone: "",
          email: "",
          role: "",
          bankName: "",
          accountNumber: "",
          accountHolder: "",
        });
        setEditingId(null);
      }
    } catch (error) {
      console.error("Failed to save employee:", error);
    }
  };

  const handleEditEmployee = (employee: Employee) => {
    setNewEmployee({
      id: employee.id,
      name: employee.name,
      phone: employee.phone || "",
      email: employee.email || "",
      role: employee.role || "",
      bankName: employee.bankName || "",
      accountNumber: employee.accountNumber || "",
      accountHolder: employee.accountHolder || "",
    });
    setEditingId(employee.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteEmployee = async (id: string) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    
    try {
      const response = await apiFetch(`/api/employees?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchEmployees();
      }
    } catch (error) {
      console.error("Failed to delete employee:", error);
    }
  };

  const roles = Array.from(new Set(employees.map(e => e.role).filter(Boolean))).sort() as string[];

  const filteredEmployees = employees.filter(e => {
    const roleMatch = !filterRole || e.role === filterRole;
    const searchMatch = !searchTerm || 
      e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (e.phone && e.phone.includes(searchTerm)) ||
      (e.id && e.id.toLowerCase().includes(searchTerm.toLowerCase()));
    return roleMatch && searchMatch;
  });

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black p-8 text-zinc-900 dark:text-zinc-100">
      <div className="max-w-5xl mx-auto space-y-8">
        <Link 
          href="/"
          className="inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors text-sm font-medium group"
        >
          <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          메인 화면으로 돌아가기
        </Link>

        <div>
          <h1 className="text-3xl font-bold">사원 및 고용주 관리</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">
            현장 관리자, 대표 및 소속 직원의 정보를 관리합니다.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <span className="w-1.5 h-5 bg-amber-500 rounded-full" />
              {editingId ? "정보 수정" : "새 사원 등록"}
            </h2>
            {editingId && (
              <button 
                onClick={() => {
                  setEditingId(null);
                  setNewEmployee({
                    id: "",
                    name: "",
                    phone: "",
                    email: "",
                    role: "",
                    bankName: "",
                    accountNumber: "",
                    accountHolder: "",
                  });
                }}
                className="text-xs text-zinc-500 hover:text-zinc-900 font-medium"
              >
                수정 취소
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-500 ml-1">사원번호/ID</label>
              <input
                type="text"
                placeholder="사원번호 (선택)"
                value={newEmployee.id}
                onChange={(e) => setNewEmployee({ ...newEmployee, id: e.target.value })}
                className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                disabled={!!editingId}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-500 ml-1">성명</label>
              <input
                type="text"
                placeholder="성명 입력..."
                value={newEmployee.name}
                onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
                className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-amber-500 outline-none transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-500 ml-1">연락처</label>
              <input
                type="text"
                placeholder="010-0000-0000"
                value={newEmployee.phone}
                onChange={(e) => setNewEmployee({ ...newEmployee, phone: e.target.value })}
                className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-amber-500 outline-none transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-500 ml-1">역할/직함</label>
              <input
                type="text"
                placeholder="예: 대표, 관리부, 현장소장..."
                value={newEmployee.role}
                onChange={(e) => setNewEmployee({ ...newEmployee, role: e.target.value })}
                list="role-suggestions"
                className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-amber-500 outline-none transition-all"
              />
              <datalist id="role-suggestions">
                {roles.map(r => <option key={r} value={r} />)}
              </datalist>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-500 ml-1">이메일</label>
              <input
                type="email"
                placeholder="email@example.com"
                value={newEmployee.email}
                onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
                className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-amber-500 outline-none transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-500 ml-1">은행명</label>
              <input
                type="text"
                placeholder="은행명"
                value={newEmployee.bankName}
                onChange={(e) => setNewEmployee({ ...newEmployee, bankName: e.target.value })}
                className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-amber-500 outline-none transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-500 ml-1">계좌번호</label>
              <input
                type="text"
                placeholder="계좌번호"
                value={newEmployee.accountNumber}
                onChange={(e) => setNewEmployee({ ...newEmployee, accountNumber: e.target.value })}
                className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-amber-500 outline-none transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-500 ml-1">예금주</label>
              <input
                type="text"
                placeholder="예금주"
                value={newEmployee.accountHolder}
                onChange={(e) => setNewEmployee({ ...newEmployee, accountHolder: e.target.value })}
                className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-amber-500 outline-none transition-all"
              />
            </div>
          </div>
          
          <div className="mt-8 pt-6 border-t border-zinc-100 dark:border-zinc-800 flex justify-end">
              <button
                onClick={handleAddEmployee}
                disabled={!newEmployee.name}
                className="px-8 py-3 bg-zinc-900 dark:bg-amber-600 hover:bg-black dark:hover:bg-amber-700 disabled:opacity-30 disabled:cursor-not-allowed text-white text-sm font-bold rounded-2xl transition-all shadow-xl shadow-zinc-900/10 dark:shadow-amber-600/20 flex items-center gap-2 group"
              >
                <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                </svg>
                {editingId ? "수정 내용 저장하기" : "새 사원 등록하기"}
              </button>
          </div>
        </div>

        {/* Filter & Search */}
        <div className="flex flex-col md:flex-row gap-4 items-end bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="flex-1 space-y-1.5 w-full">
            <label className="text-xs font-bold text-zinc-500 ml-1">역할 필터</label>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-amber-500 outline-none transition-all appearance-none cursor-pointer"
            >
              <option value="">전체 역할</option>
              {roles.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
          <div className="flex-[2] space-y-1.5 w-full">
            <label className="text-xs font-bold text-zinc-500 ml-1">검색</label>
            <input
              type="text"
              placeholder="성명, 연락처, 사원번호로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-amber-500 outline-none transition-all"
            />
          </div>
          <button
            onClick={() => {
              setFilterRole("");
              setSearchTerm("");
            }}
            className="px-4 py-2 text-sm font-bold text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
          >
            초기화
          </button>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-zinc-50/50 dark:bg-zinc-800/20 border-b border-zinc-200 dark:border-zinc-800 text-left">
                  <th className="px-6 py-4 font-semibold text-zinc-500">사원번호</th>
                  <th className="px-6 py-4 font-semibold text-zinc-500">성명</th>
                  <th className="px-6 py-4 font-semibold text-zinc-500">역할/직함</th>
                  <th className="px-6 py-4 font-semibold text-zinc-500">연락처</th>
                  <th className="px-6 py-4 font-semibold text-zinc-500">계좌정보</th>
                  <th className="px-6 py-4 font-semibold text-zinc-500 text-right">관리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-zinc-400 dark:text-zinc-500 italic">
                      데이터를 불러오는 중...
                    </td>
                  </tr>
                ) : filteredEmployees.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-zinc-400 dark:text-zinc-500 italic">
                      검색 결과가 없습니다.
                    </td>
                  </tr>
                ) : (
                  filteredEmployees.map((employee) => (
                    <tr key={employee.id} className="group hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                      <td className="px-6 py-4 font-medium text-zinc-500">
                        {employee.id}
                      </td>
                      <td className="px-6 py-4 font-bold text-zinc-900 dark:text-zinc-100">
                        {employee.name}
                      </td>
                      <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400">
                        <span className="px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded text-xs">
                          {employee.role || "-"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400">
                        {employee.phone || "-"}
                      </td>
                      <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400">
                        {employee.bankName ? (
                          <div className="flex flex-col text-xs">
                            <span>{employee.bankName}</span>
                            <span className="text-zinc-400">{employee.accountNumber}</span>
                            <span className="text-zinc-400">({employee.accountHolder})</span>
                          </div>
                        ) : "-"}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEditEmployee(employee)}
                            className="p-2 text-zinc-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors"
                            title="수정"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteEmployee(employee.id)}
                            className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            title="삭제"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
