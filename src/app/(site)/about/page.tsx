import type { Metadata } from "next";
import Link from "next/link";
import LegalPage, { type LegalSection } from "@/components/legal/LegalPage";
import { siteConfig } from "@/config/site";
import { aboutPageJsonLd, breadcrumbJsonLd, graph } from "@/lib/seo/jsonld";
import { buildMetadata } from "@/lib/seo/metadata";

// Draft text — to be reviewed by the site owner before launch.
const description =
  "ที่มาและเป้าหมายของ Thailand Story Map แผนที่รวมเรื่องเล่าทั่วประเทศไทย วิธีที่เราตรวจสอบเนื้อหา การรายงานเรื่องที่ไม่เหมาะสม และช่องทางติดต่อทีมงาน";

export const metadata: Metadata = buildMetadata({
  title: "เกี่ยวกับเรา — ที่มาของแผนที่เรื่องเล่าประเทศไทย",
  description,
  path: "/about",
});

const crumbs = [
  { name: "หน้าแรก", path: "/" },
  { name: "เกี่ยวกับเรา", path: "/about" },
];

export default function AboutPage() {
  const sections: LegalSection[] = [
    {
      id: "story",
      title: "ที่มา",
      body: (
        <>
          <p>
            ทุกจังหวัดมีเรื่องที่คนในพื้นที่เล่าต่อกันมา ทั้งตำนาน เรื่องลี้ลับ ประวัติศาสตร์ของสถานที่
            และความทรงจำเล็ก ๆ ที่ไม่เคยถูกบันทึกไว้ที่ไหน เรื่องเหล่านี้มักกระจัดกระจายอยู่ในโพสต์โซเชียล
            กระทู้เก่า หรือคำบอกเล่าของคนรุ่นก่อน แล้วค่อย ๆ หายไป
          </p>
          <p>
            {siteConfig.name} ({siteConfig.nameTh}) จึงเป็นแผนที่ที่ให้ทุกคนปักหมุดเรื่องเล่าลงบนสถานที่จริง
            เพื่อให้คนอ่านได้รู้ว่าเรื่องนั้นเกิดขึ้นที่ไหน และเดินทางไปสัมผัสได้ด้วยตัวเอง
          </p>
        </>
      ),
    },
    {
      id: "goals",
      title: "เป้าหมาย",
      body: (
        <ul>
          <li>เก็บเรื่องเล่าท้องถิ่นจากทั้ง 77 จังหวัดไว้ในที่เดียว อ่านได้ฟรี</li>
          <li>ให้ทุกเรื่องผูกกับพิกัดจริง เพื่อให้เรื่องเล่าเป็นส่วนหนึ่งของการเดินทาง</li>
          <li>ให้เจ้าของเรื่องได้รับเครดิต และให้ผู้อ่านรู้ว่าใครเป็นผู้เล่า</li>
        </ul>
      ),
    },
    {
      id: "review",
      title: "วิธีตรวจสอบเนื้อหา",
      body: (
        <>
          <p>
            เรื่องส่วนใหญ่เขียนโดยผู้ใช้ที่ล็อกอินด้วยบัญชี Google และเผยแพร่ทันทีหลังส่ง
            ยกเว้นหมวด <strong>คดีอาชญากรรม</strong> ที่ต้องแนบแหล่งอ้างอิงและผ่านการตรวจโดยทีมงานก่อนเผยแพร่ทุกเรื่อง
            เรื่องที่แก้ไขหลังเผยแพร่ในบางกรณีจะกลับไปรอตรวจอีกครั้ง
          </p>
          <p>
            เรื่องลี้ลับและตำนานเป็นเรื่องเล่าและความเชื่อ เราไม่ได้รับรองว่าเหตุการณ์ในเรื่องเกิดขึ้นจริง
            ส่วนเรื่องที่อ้างข้อเท็จจริง เราแนะนำให้ผู้เขียนแนบแหล่งข้อมูลไว้ท้ายเรื่อง
          </p>
        </>
      ),
    },
    {
      id: "report",
      title: "การรายงานเรื่อง",
      body: (
        <p>
          หากพบเรื่องที่ให้ข้อมูลเท็จ ละเมิดลิขสิทธิ์ ละเมิดความเป็นส่วนตัว หรือไม่เหมาะสม
          กดปุ่ม &ldquo;รายงานเรื่องนี้&rdquo; ท้ายหน้าเรื่องได้ ทีมงานจะตรวจสอบและอาจซ่อนเรื่องนั้นจากแผนที่
          ดูรายละเอียดเพิ่มเติมได้ใน <Link href="/terms">ข้อกำหนดการใช้งาน</Link>
        </p>
      ),
    },
    {
      id: "contact",
      title: "ติดต่อทีมงาน",
      body: siteConfig.contactEmail ? (
        <p>
          ติดต่อเรื่องเนื้อหา ความร่วมมือ หรือคำขอเกี่ยวกับข้อมูลส่วนบุคคล ได้ที่{" "}
          <a href={`mailto:${siteConfig.contactEmail}`}>{siteConfig.contactEmail}</a>
        </p>
      ) : (
        <p>
          หากต้องการแจ้งปัญหาเกี่ยวกับเรื่องใดเรื่องหนึ่ง ใช้ปุ่ม &ldquo;รายงานเรื่องนี้&rdquo; ในหน้าเรื่องนั้นได้เลย
        </p>
      ),
    },
  ];

  return (
    <LegalPage
      eyebrow="เกี่ยวกับเรา"
      title={siteConfig.nameTh}
      description={siteConfig.tagline}
      crumbs={crumbs}
      sections={sections}
      jsonLd={graph(
        aboutPageJsonLd({ name: `เกี่ยวกับ ${siteConfig.name}`, description, path: "/about" }),
        breadcrumbJsonLd(crumbs)
      )}
    />
  );
}
