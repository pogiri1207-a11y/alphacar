// app/components/BrandTestDriveSection.tsx
"use client";

import { useRef, useEffect, useState } from "react";

interface Brand {
  id: string;
  name: string;
  logo: string;
  url: string;
}

const brands: Brand[] = [
  {
    id: "hyundai",
    name: "현대",
    logo: "https://carbar.co.kr/static/images/brand/hyundai.png",
    url: "https://www.hyundai.com/kr/ko/e/vehicles/test-driving",
  },
  {
    id: "kia",
    name: "기아",
    logo: "https://carbar.co.kr/static/images/brand/kia.png",
    url: "https://www.kia.com/kr/experience/book-a-test-drive/guide",
  },
  {
    id: "genesis",
    name: "제네시스",
    logo: "https://carbar.co.kr/static/images/brand/genesis.png",
    url: "https://www.genesis.com/kr/ko/experience/genesis-drive.html",
  },
  {
    id: "renault",
    name: "르노코리아",
    logo: "https://carbar.co.kr/static/images/brand/renault.png",
    url: "https://www.kg-mobility.com/od/network/bridge",
  },
  {
    id: "kgm",
    name: "KGM",
    logo: "https://carbar.co.kr/static/images/brand/kgm.png",
    url: "https://www.kg-mobility.com/od/network/bridge",
  },
  {
    id: "chevrolet",
    name: "쉐보레",
    logo: "https://carbar.co.kr/static/images/brand/chevrolet.png",
    url: "https://www.chevrolet.co.kr/request-test-drive",
  },
  {
    id: "benz",
    name: "벤츠",
    logo: "https://carbar.co.kr/static/images/brand/benz.png",
    url: "https://www.mercedes-benz.co.kr/passengercars/test-drive.html",
  },
  {
    id: "bmw",
    name: "BMW",
    logo: "https://carbar.co.kr/static/images/brand/bmw.png",
    url: "https://www.bmw.co.kr/ko/fastlane/tda-experience.html",
  },
  {
    id: "audi",
    name: "아우디",
    logo: "https://carbar.co.kr/static/images/brand/audi.png",
    url: "https://www.audi.co.kr/ko/aboutaudi/Auditoyou/",
  },
  {
    id: "vw",
    name: "폭스바겐",
    logo: "https://carbar.co.kr/static/images/brand/volkswagen.png",
    url: "https://www.volkswagen.co.kr/app/local/testdrive/requestform",
  },
  {
    id: "volvo",
    name: "볼보",
    logo: "https://carbar.co.kr/static/images/brand/volvo.png",
    url: "https://www.volvocars.com/kr/",
  },
  {
    id: "lexus",
    name: "렉서스",
    logo: "https://carbar.co.kr/static/images/brand/lexus.png",
    url: "https://www.lexus.co.kr/test-drive/?page_id=main",
  },
  {
    id: "toyota",
    name: "토요타",
    logo: "https://carbar.co.kr/static/images/brand/toyota.png",
    url: "https://www.toyota.co.kr/test-drive/",
  },
  {
    id: "tesla",
    name: "테슬라",
    logo: "https://carbar.co.kr/static/images/brand/tesla.png",
    url: "https://www.tesla.com/ko_KR/drive",
  },
  {
    id: "landrover",
    name: "랜드로버",
    logo: "https://carbar.co.kr/static/images/brand/landrover.png",
    url: "https://www.landroverkorea.co.kr/book-a-test-drive/index.html",
  },
  {
    id: "porsche",
    name: "포르쉐",
    logo: "https://carbar.co.kr/static/images/brand/porche.png",
    url: "https://dealer.porsche.com/kr/songpa/ko-KR/Request-a-Test-Drive",
  },
  {
    id: "mini",
    name: "미니",
    logo: "https://carbar.co.kr/static/images/brand/mini.png",
    url: "https://www.mini.co.kr/ko_KR/home/range/john-cooper-works.html",
  },
  {
    id: "ford",
    name: "포드",
    logo: "https://carbar.co.kr/static/images/brand/ford.png",
    url: "https://www.ford.co.kr/mustang-kmi/",
  },
  {
    id: "lincoln",
    name: "링컨",
    logo: "https://carbar.co.kr/static/images/brand/lincoln.png",
    url: "https://www.lincoln-korea.com/vehicles/nautilus/",
  },
  {
    id: "jeep",
    name: "지프",
    logo: "https://carbar.co.kr/static/images/brand/jeep.png",
    url: "https://www.jeep.co.kr/shopping_tools/satd.html",
  },
  {
    id: "peugeot",
    name: "푸조",
    logo: "https://carbar.co.kr/static/images/brand/peugeot.png",
    url: "https://base.epeugeot.co.kr/Form?rsf=RSF200716180915",
  },
  {
    id: "cadillac",
    name: "캐딜락",
    logo: "https://carbar.co.kr/static/images/brand/cadillac.png",
    url: "https://www.cadillac.co.kr/request-test-drive",
  },
  {
    id: "polestar",
    name: "폴스타",
    logo: "https://carbar.co.kr/static/images/brand/polestar.png",
    url: "https://www.polestar.com/kr/test-drive/booking",
  },
  {
    id: "maserati",
    name: "마세라티",
    logo: "https://carbar.co.kr/static/images/brand/maserati.png",
    url: "https://www.maserati.com/kr/ko/shopping-tools/test-drive",
  },
  {
    id: "honda",
    name: "혼다",
    logo: "https://carbar.co.kr/static/images/brand/honda.png",
    url: "https://exp.hondakorea.co.kr/cafethego/",
  },
  {
    id: "byd",
    name: "BYD",
    logo: "https://carbar.co.kr/static/images/brand/byd.png",
    url: "https://www.bydauto.kr/purchase/test-drive/seal",
  },
];

const AUTO_SCROLL_INTERVAL = 2000;
const AUTO_SCROLL_STEP = 280;

export default function BrandTestDriveSection() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isHover, setIsHover] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);

  const updateProgress = () => {
    const el = scrollRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    if (max <= 0) {
      setProgress(0);
    } else {
      setProgress(el.scrollLeft / max);
    }
  };

  // 자동으로 오른쪽으로 흘러가는 모션
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    updateProgress();

    const timer = setInterval(() => {
      if (!scrollRef.current || isHover) return;

      const maxScroll = scrollRef.current.scrollWidth - scrollRef.current.clientWidth;
      const next = scrollRef.current.scrollLeft + AUTO_SCROLL_STEP;

      if (next >= maxScroll) {
        scrollRef.current.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        scrollRef.current.scrollTo({ left: next, behavior: "smooth" });
      }
    }, AUTO_SCROLL_INTERVAL);

    return () => clearInterval(timer);
  }, [isHover]);

  const scrollByDirection = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = AUTO_SCROLL_STEP;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  const handleScroll = () => {
    updateProgress();
  };

  return (
    <section className="brand-testdrive-section">
      <h2 className="brand-testdrive-title">제조사별 차량 시승 신청해보세요</h2>

      {/* 브랜드 슬라이더 */}
      <div
        className="brand-testdrive-wrapper"
        onMouseEnter={() => setIsHover(true)}
        onMouseLeave={() => setIsHover(false)}
      >
        {/* 위쪽 동그라미 화살표 */}
        <button
          type="button"
          className="brand-testdrive-arrow left"
          onClick={() => scrollByDirection("left")}
        >
          {"<"}
        </button>

        <button
          type="button"
          className="brand-testdrive-arrow right"
          onClick={() => scrollByDirection("right")}
        >
          {">"}
        </button>

        <div ref={scrollRef} className="brand-testdrive-scroll" onScroll={handleScroll}>
          <div className="brand-testdrive-list">
            {brands.map((brand) => (
              <a
                key={brand.id}
                href={brand.url}
                target="_blank"
                rel="noopener noreferrer"
                className="brand-testdrive-item"
              >
                <div className="brand-testdrive-logo">
                  <img src={brand.logo} alt={brand.name} />
                </div>
                <span className="brand-testdrive-name">{brand.name}</span>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* 아래 진행 바 + 화살표도 동작 */}
      <div className="brand-testdrive-progress">
        <div className="brand-testdrive-progress-inner">
          <div className="brand-testdrive-progress-line">
            <div
              className="brand-testdrive-progress-indicator"
              style={{ width: `${Math.max(progress * 100, 6)}%` }}
            />
          </div>
          <div className="brand-testdrive-progress-arrows">
            <button type="button" onClick={() => scrollByDirection("left")}>
              {"<"}
            </button>
            <span>|</span>
            <button type="button" onClick={() => scrollByDirection("right")}>
              {">"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}


