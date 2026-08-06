"use client";

import { useState } from "react";

export default function BusinessVerificationPage() {
  const [submitted, setSubmitted] = useState(false);
  return (
    <main className="store-main page-main verification-page">
      <div className="page-title-row"><div><p className="eyebrow">BUSINESS MEMBER</p><h1>사업자 인증</h1><p>처음 한 번만 접수하면 승인 후 사업자 전용 가격이 자동으로 표시됩니다.</p></div></div>
      <div className="step-indicator"><div className="active"><b>1</b><span>정보 입력</span></div><i /><div><b>2</b><span>관리자 확인</span></div><i /><div><b>3</b><span>사업자가 적용</span></div></div>
      {submitted ? <section className="success-panel"><span>✓</span><h2>사업자 인증이 접수되었습니다.</h2><p>관리자가 등록증을 확인한 뒤 회원 등급을 직접 변경합니다.</p><div className="admin-alert-preview"><strong>관리자 알림 생성됨</strong><p>사업자 인증 후 회원 유형과 가격 등급을 변경해주세요.</p></div><button type="button" className="secondary-button" onClick={() => setSubmitted(false)}>접수 화면 다시보기</button></section> : <form className="verification-form" onSubmit={(event) => { event.preventDefault(); setSubmitted(true); }}>
        <section className="form-section"><div className="section-number">01</div><div className="form-section-body"><h2>사업자 정보</h2><div className="field-grid"><label><span>상호명</span><input required placeholder="예: 진흥플라워" /></label><label><span>대표자명</span><input required placeholder="대표자명 입력" /></label><label><span>사업자등록번호</span><input required inputMode="numeric" placeholder="000-00-00000" /></label><label><span>업종</span><select defaultValue=""><option value="" disabled>업종 선택</option><option>꽃집·플라워샵</option><option>인테리어·공간장식</option><option>웨딩·행사</option><option>조화 도소매</option><option>기타</option></select></label></div></div></section>
        <section className="form-section"><div className="section-number">02</div><div className="form-section-body"><h2>사업자등록증</h2><label className="upload-zone"><input type="file" accept="image/*,.pdf" /><b>＋</b><strong>등록증 파일 선택</strong><span>JPG, PNG, PDF · 최대 10MB</span></label><p className="implementation-note">현재 화면에서는 파일명만 표시하도록 구현하며 실제 업로드 저장소는 추후 연결합니다.</p></div></section>
        <section className="form-section"><div className="section-number">03</div><div className="form-section-body"><h2>담당자 연락처</h2><div className="field-grid"><label><span>담당자명</span><input required placeholder="담당자명 입력" /></label><label><span>휴대전화 번호</span><input required inputMode="tel" placeholder="010-0000-0000" /></label></div></div></section>
        <div className="submit-area"><button type="submit" className="primary-button">인증 접수하기</button><p>접수 시 관리자 화면에 확인 알림이 표시됩니다.</p></div>
      </form>}
    </main>
  );
}
