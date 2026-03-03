"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { useDaumPostcodePopup, Address } from "react-daum-postcode";
import { StatusBadge } from "@/components/estimate/StatusBadge";
import type { EstimateStatus } from "@/types/estimate";

export default function CustomerInfoPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    postcode: "",
    address: "",
    detailAddress: "",
    shortAddress: "",
    size: "",
    phone1: "",
    phone2: "",
  });

  const scriptUrl = "https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";
  const open = useDaumPostcodePopup(scriptUrl);

  const handleComplete = (data: Address) => {
    let fullAddress = data.address;
    let extraAddress = "";

    if (data.addressType === "R") {
      if (data.bname !== "") {
        extraAddress += data.bname;
      }
      if (data.buildingName !== "") {
        extraAddress += extraAddress !== "" ? `, ${data.buildingName}` : data.buildingName;
      }
      fullAddress += extraAddress !== "" ? ` (${extraAddress})` : "";
    }

    setFormData((prev) => ({
      ...prev,
      postcode: data.zonecode,
      address: fullAddress,
      shortAddress: data.buildingName ? `${data.bname} ${data.buildingName}` : data.bname || data.sigungu,
    }));
  };

  const handleSearchAddress = () => {
    open({ onComplete: handleComplete });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // 1. Save/Update Customer
      const customerResponse = await apiFetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!customerResponse.ok) throw new Error("고객 정보 저장 실패");
      const customerData = await customerResponse.json();
      const customerId = customerData.id;

      if (!customerId) throw new Error("고객 ID 생성 실패");

      // 2. Create Estimate
      const estimateResponse = await apiFetch("/api/estimates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId,
          status: "상담접수",
        }),
      });

      if (!estimateResponse.ok) throw new Error("견적서 생성 실패");
      const estimateData = await estimateResponse.json();
      
      router.push(`/estimate?id=${estimateData.id}`);
    } catch (error) {
      console.error("Error creating estimate:", error);
      alert("견적 생성 중 오류가 발생했습니다.");
    }
  };

  const [existingEstimates, setExistingEstimates] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const searchExistingCustomer = async (name: string) => {
    if (name.length < 2) {
      setExistingEstimates([]);
      return;
    }
    try {
      setIsSearching(true);
      const response = await apiFetch(`/api/customers?name=${encodeURIComponent(name)}`);
      if (response.ok) {
        const customers = await response.json();
        if (customers.length > 0) {
          // If customer found, fetch their estimates
          const estResponse = await apiFetch("/api/estimates"); // This is a bit inefficient, but works for now
          if (estResponse.ok) {
            const allEstimates = await estResponse.json();
            const customerIds = customers.map((c: any) => c.id);
            const customerEstimates = allEstimates.filter((e: any) => customerIds.includes(e.customerId));
            setExistingEstimates(customerEstimates);
          }
        } else {
          setExistingEstimates([]);
        }
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    handleChange(e);
    searchExistingCustomer(value);
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen items-center lg:items-start justify-center bg-zinc-50 py-12 px-4 dark:bg-black sm:px-6 lg:px-8 gap-8">
      <div className="w-full max-w-md space-y-8">
        <div className="bg-white p-8 rounded-xl shadow-lg dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
              고객 정보 입력
            </h2>
            <p className="mt-2 text-center text-sm text-zinc-600 dark:text-zinc-400">
              상담을 위한 고객 정보를 입력해주세요.
            </p>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4 rounded-md shadow-sm">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  고객명
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-zinc-900 placeholder-zinc-500 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100 dark:placeholder-zinc-400"
                  placeholder="고객 성함을 입력하세요"
                  value={formData.name}
                  onChange={handleNameChange}
                />
              </div>

              {/* Address Section */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  주소 (도로명 주소)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    placeholder="우편번호"
                    value={formData.postcode}
                    className="block w-24 rounded-md border border-zinc-300 bg-zinc-50 px-3 py-2 text-zinc-900 sm:text-sm dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100"
                  />
                  <button
                    type="button"
                    onClick={handleSearchAddress}
                    className="inline-flex items-center rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-700"
                  >
                    주소 검색
                  </button>
                </div>
                <input
                  type="text"
                  readOnly
                  placeholder="기본 주소"
                  value={formData.address}
                  className="block w-full rounded-md border border-zinc-300 bg-zinc-50 px-3 py-2 text-zinc-900 sm:text-sm dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100"
                />
                <input
                  id="detailAddress"
                  name="detailAddress"
                  type="text"
                  className="block w-full rounded-md border border-zinc-300 px-3 py-2 text-zinc-900 placeholder-zinc-500 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100 dark:placeholder-zinc-400"
                  placeholder="상세 주소를 입력하세요 (동, 호수 등)"
                  value={formData.detailAddress}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="shortAddress" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  현장 명칭 (간략 주소)
                </label>
                <input
                  id="shortAddress"
                  name="shortAddress"
                  type="text"
                  className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-zinc-900 placeholder-zinc-500 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100 dark:placeholder-zinc-400"
                  placeholder="다른 현장과 구분되는 명칭을 입력하세요 (예: 한남 더힐 302호)"
                  value={formData.shortAddress}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="size" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  평형
                </label>
                <input
                  id="size"
                  name="size"
                  type="text"
                  className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-zinc-900 placeholder-zinc-500 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100 dark:placeholder-zinc-400"
                  placeholder="평형을 입력하세요 (예: 32평)"
                  value={formData.size}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label htmlFor="phone1" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  연락처1
                </label>
                <input
                  id="phone1"
                  name="phone1"
                  type="tel"
                  className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-zinc-900 placeholder-zinc-500 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100 dark:placeholder-zinc-400"
                  placeholder="010-0000-0000"
                  value={formData.phone1}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label htmlFor="phone2" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  연락처2
                </label>
                <input
                  id="phone2"
                  name="phone2"
                  type="tel"
                  className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-zinc-900 placeholder-zinc-500 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100 dark:placeholder-zinc-400"
                  placeholder="추가 연락처 (필수 아님)"
                  value={formData.phone2}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                className="group relative flex w-full justify-center rounded-md border border-transparent bg-indigo-600 py-3 px-4 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-indigo-400 transition-colors"
              >
                견적서 작성하기
              </button>
            </div>
          </form>
        </div>
      </div>

      {existingEstimates.length > 0 && (
        <div className="flex-1 max-w-2xl space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
          <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 px-1">
            이전 견적 내역이 있습니다
          </h3>
          <div className="grid grid-cols-1 gap-6">
            {existingEstimates.map((est) => (
              <Link
                key={est.estimateCode}
                href={`/estimate?id=${est.id}`}
                className="group bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <StatusBadge status={est.status as EstimateStatus} />
                    <span className="text-xs font-mono text-zinc-400">
                      {est.estimateCode}
                    </span>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {est.customerName}
                    </h3>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-1">
                      {est.shortAddress}
                    </p>
                  </div>

                  <div className="pt-2 grid grid-cols-2 gap-y-2 border-t border-zinc-100 dark:border-zinc-800">
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">견적일</div>
                    <div className="text-xs font-medium text-zinc-900 dark:text-zinc-100 text-right">
                      {est.estimateDate}
                    </div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">공사기간</div>
                    <div className="text-xs font-medium text-zinc-900 dark:text-zinc-100 text-right">
                      {est.constructionStartDate} ~ {est.constructionEndDate}
                    </div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">담당자</div>
                    <div className="text-xs font-medium text-zinc-900 dark:text-zinc-100 text-right">
                      {est.manager}
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between pt-4 border-t border-zinc-100 dark:border-zinc-800">
                  <span className="text-sm text-zinc-500 dark:text-zinc-400">총 견적금액</span>
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                      {est.totalAmount?.toLocaleString()}원
                    </span>
                    <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                      이어서 작성하기 <span>&rarr;</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
