import {
  pgTable,
  serial,
  text,
  varchar,
  timestamp,
  boolean,
  integer,
  jsonb,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 100 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: varchar("name", { length: 200 }).notNull(),
  specialty: varchar("specialty", { length: 200 }),
  role: varchar("role", { length: 20 }).notNull(), // 'admin' | 'doctor'
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const patients = pgTable("patients", {
  id: serial("id").primaryKey(),
  patientId: varchar("patient_id", { length: 50 }).notNull().unique(),
  nationalId: varchar("national_id", { length: 50 }),
  name: varchar("name", { length: 300 }).notNull(),
  age: integer("age"),
  gender: varchar("gender", { length: 20 }),
  admissionDate: timestamp("admission_date"),
  department: varchar("department", { length: 200 }),
  roomBed: varchar("room_bed", { length: 50 }),
  consultant: varchar("consultant", { length: 200 }),
  diagnosis: text("diagnosis"),
  createdBy: integer("created_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const formTemplates = pgTable("form_templates", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  icon: varchar("icon", { length: 50 }).default("FileText").notNull(),
  description: text("description"),
  schema: jsonb("schema").notNull(), // { sections: [{ title, fields: [...] }] }
  scoringType: varchar("scoring_type", { length: 50 }), // 'padua' | 'caprini' | 'apache' | null
  isActive: boolean("is_active").default(true).notNull(),
  orderIndex: integer("order_index").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const formSubmissions = pgTable("form_submissions", {
  id: serial("id").primaryKey(),
  templateId: integer("template_id")
    .notNull()
    .references(() => formTemplates.id, { onDelete: "cascade" }),
  patientId: integer("patient_id")
    .notNull()
    .references(() => patients.id, { onDelete: "cascade" }),
  doctorId: integer("doctor_id")
    .notNull()
    .references(() => users.id),
  data: jsonb("data").notNull(), // { [fieldKey]: value, _score?: number }
  status: varchar("status", { length: 30 }).default("draft").notNull(), // draft, in_progress, completed, printed
  score: integer("score"),
  scoreLabel: varchar("score_label", { length: 100 }),
  pdfData: text("pdf_data"), // base64 PDF
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
