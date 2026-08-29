const { createClient } = require('@libsql/client');

async function main() {
  const db = createClient({
    url: 'libsql://jeff-studio-jeffstudiio.aws-us-east-1.turso.io',
    authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODgwMjExNjUsImlkIjoiMDFhMDQzZGMtMDEwMS03Y2FlLTk5OTQtMTk4NmJjN2MwNzFmIiwia2lkIjoieDNRaVZLUzJfc2kxTklVdjhEZDNaRlJPSUJqdGpBWGNqY2FuRTJ2bVp6OCIsInJpZCI6ImUwYWNhNzlhLTE5OTktNDM1Yy04ZTQ4LWJlZGM2Nzc0MjhjNiJ9.PYXQPzjBi1kqaZeyhQPqCzcaItTsSDEsdrL2zBOgRL6RehLgimgszAJWXN-HzHKykPGTPvEwyMRcweHcV14iBA',
  });

  const statements = [
    `CREATE TABLE "Category" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "titleFa" TEXT NOT NULL,
    "titleEn" TEXT NOT NULL,
    "descriptionFa" TEXT,
    "descriptionEn" TEXT,
    "coverImage" TEXT,
    "videoUrl" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
  )`,

    `CREATE TABLE "SubCategory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "titleFa" TEXT NOT NULL,
    "titleEn" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "categoryId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SubCategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE CASCADE ON UPDATE CASCADE
  )`,

    `CREATE TABLE "Project" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "titleFa" TEXT NOT NULL,
    "titleEn" TEXT NOT NULL,
    "descriptionFa" TEXT,
    "descriptionEn" TEXT,
    "clientFa" TEXT,
    "clientEn" TEXT,
    "locationFa" TEXT,
    "locationEn" TEXT,
    "year" TEXT,
    "status" TEXT NOT NULL DEFAULT 'published',
    "order" INTEGER NOT NULL DEFAULT 0,
    "categoryId" TEXT NOT NULL,
    "subcategoryId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Project_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Project_subcategoryId_fkey" FOREIGN KEY ("subcategoryId") REFERENCES "SubCategory" ("id") ON DELETE SET NULL ON UPDATE CASCADE
  )`,

    `CREATE TABLE "ProjectImage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "url" TEXT NOT NULL,
    "altFa" TEXT,
    "altEn" TEXT,
    "isCover" BOOLEAN NOT NULL DEFAULT false,
    "isVideo" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "projectId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ProjectImage_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
  )`,

    `CREATE TABLE "Service" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "titleFa" TEXT NOT NULL,
    "titleEn" TEXT NOT NULL,
    "descFa" TEXT NOT NULL,
    "descEn" TEXT NOT NULL,
    "priceFa" TEXT NOT NULL,
    "priceEn" TEXT NOT NULL,
    "iconSvg" TEXT NOT NULL,
    "featuresFa" TEXT NOT NULL,
    "featuresEn" TEXT NOT NULL,
    "noteFa" TEXT NOT NULL DEFAULT '',
    "noteEn" TEXT NOT NULL DEFAULT '',
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
  )`,

    `CREATE TABLE "SiteSetting" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL
  )`,

    `CREATE TABLE "AboutInfo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "profilePhoto" TEXT NOT NULL DEFAULT '',
    "bioFa" TEXT NOT NULL DEFAULT '',
    "bioEn" TEXT NOT NULL DEFAULT '',
    "subtitleFa" TEXT NOT NULL DEFAULT '',
    "subtitleEn" TEXT NOT NULL DEFAULT '',
    "skillsJson" TEXT NOT NULL DEFAULT '[]',
    "statsJson" TEXT NOT NULL DEFAULT '[]',
    "experienceJson" TEXT NOT NULL DEFAULT '[]',
    "educationJson" TEXT NOT NULL DEFAULT '[]',
    "updatedAt" DATETIME NOT NULL
  )`,

    `CREATE TABLE "ContactInfo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "titleFa" TEXT NOT NULL DEFAULT '',
    "titleEn" TEXT NOT NULL DEFAULT '',
    "descFa" TEXT NOT NULL DEFAULT '',
    "descEn" TEXT NOT NULL DEFAULT '',
    "addressFa" TEXT NOT NULL DEFAULT '',
    "addressEn" TEXT NOT NULL DEFAULT '',
    "phone" TEXT NOT NULL DEFAULT '',
    "email" TEXT NOT NULL DEFAULT '',
    "whatsapp" TEXT NOT NULL DEFAULT '',
    "telegram" TEXT NOT NULL DEFAULT '',
    "socialsJson" TEXT NOT NULL DEFAULT '[]',
    "updatedAt" DATETIME NOT NULL
  )`,

    `CREATE TABLE "Message" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL DEFAULT '',
    "message" TEXT NOT NULL,
    "serviceIndex" INTEGER,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,

    `CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug")`,
    `CREATE UNIQUE INDEX "SubCategory_slug_categoryId_key" ON "SubCategory"("slug", "categoryId")`,
    `CREATE UNIQUE INDEX "Project_slug_key" ON "Project"("slug")`,
    `CREATE UNIQUE INDEX "SiteSetting_key_key" ON "SiteSetting"("key")`,
  ];

  for (let i = 0; i < statements.length; i++) {
    try {
      await db.execute(statements[i]);
      console.log(`✅ [${i+1}/${statements.length}] OK`);
    } catch (err) {
      console.error(`❌ [${i+1}/${statements.length}] Error: ${err.message}`);
    }
  }

  console.log('\n✅ Done! All tables created on Turso.');
}

main();
