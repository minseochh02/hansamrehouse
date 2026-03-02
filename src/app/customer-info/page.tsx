"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDaumPostcodePopup, Address } from "react-daum-postcode";

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitted Data:", formData);
    router.push("/estimate");
  };

  const isExistingCustomer = formData.name === "기존고객";

  const previousEstimates = [
    {
      id: "EST-2024-001",
      date: "2024-02-15",
      title: "한남 더힐 주방 리모델링",
      total: "25,000,000원",
    },
  ];

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
                  placeholder="기존 고객 확인을 위해 '기존고객'을 입력해보세요"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
              {/* ... existing fields ... */}

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

          <div>
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

    {isExistingCustomer && (
        <div className="mt-8 space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 px-1">
            이전 견적 내역이 있습니다
          </h3>
          {previousEstimates.map((est) => (
            <div
              key={est.id}
              className="bg-white p-6 rounded-xl shadow-md border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all hover:shadow-lg"
            >
              <div className="space-y-1">
                <p className="text-xs font-mono text-zinc-500 uppercase tracking-wider">
                  {est.id} · {est.date}
                </p>
                <h4 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                  {est.title}
                </h4>
                <p className="text-sm text-indigo-600 dark:text-indigo-400 font-medium">
                  {est.total}
                </p>
              </div>
              <button
                type="button"
                onClick={() => router.push(`/estimate?id=${est.id}`)}
                className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-zinc-300 shadow-sm text-sm font-medium rounded-md text-zinc-700 bg-white hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-700 transition-colors"
              >
                이어서 작성하기
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
