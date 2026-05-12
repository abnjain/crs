/**
 * ============================================================
 * User Model - Authentication and RBAC
 * Supports single role (legacy) and roles array (multi-role)
 * ============================================================
 */

import mongoose, { Document, Model, Schema } from 'mongoose';
import bcrypt from 'bcrypt';

export type UserRole = 'superadmin' | 'admin' | 'hod' | 'faculty' | 'alumni';

export const ROLE_HIERARCHY: UserRole[] = ['alumni', 'faculty', 'hod', 'admin', 'superadmin'];

/** Get highest-priority role from roles array */
export function getPrimaryRole(roles: UserRole[]): UserRole {
  if (!roles?.length) return 'alumni';
  let highest = roles[0];
  for (const r of roles) {
    if (ROLE_HIERARCHY.indexOf(r) > ROLE_HIERARCHY.indexOf(highest)) {
      highest = r;
    }
  }
  return highest;
}

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  roles: UserRole[];
  /** Self-registered accounts start false until admin/superadmin approval */
  isVerified: boolean;
  isActive: boolean;
  messagingBanned: boolean;
  messagingBannedReason?: string;
  messagingBannedAt?: Date;
  /** Faculty (and optionally staff): alumni may DM when opt-in allows */
  messagingOptIn: boolean;
  deletionRequestedAt?: Date;
  deletionScheduledFor?: Date;
  deletionDeleteDocuments?: boolean;
  /** Pending email verification - OTP confirmation required */
  pendingEmail?: string;
  /** Stored as hashed OTP code */
  pendingEmailToken?: string;
  pendingEmailExpires?: Date;
  correctPassword(candidate: string, userPassword: string): Promise<boolean>;
  getEffectiveRoles(): UserRole[];
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: ['superadmin', 'admin', 'hod', 'faculty', 'alumni'],
      default: 'alumni',
    },
    roles: {
      type: [String],
      enum: ['superadmin', 'admin', 'hod', 'faculty', 'alumni'],
      default: undefined,
    },
    isVerified: {
      type: Boolean,
      default: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    messagingBanned: {
      type: Boolean,
      default: false,
    },
    messagingBannedReason: {
      type: String,
      trim: true,
    },
    messagingBannedAt: {
      type: Date,
    },
    messagingOptIn: {
      type: Boolean,
      default: true,
    },
    deletionRequestedAt: {
      type: Date,
    },
    deletionScheduledFor: {
      type: Date,
    },
    deletionDeleteDocuments: {
      type: Boolean,
      default: false,
    },
    pendingEmail: {
      type: String,
      lowercase: true,
      trim: true,
    },
    pendingEmailToken: {
      type: String,
      select: false,
    },
    pendingEmailExpires: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(doc: IUser, ret) {
        const roles = doc.getEffectiveRoles?.() ?? (ret.roles?.length ? ret.roles : [ret.role]);
        ret.role = getPrimaryRole(roles as UserRole[]);
        ret.roles = roles;
      },
    },
  }
);

// Sync role/roles before save
userSchema.pre('save', function () {
  if (this.roles?.length) {
    this.role = getPrimaryRole(this.roles as UserRole[]);
  } else if (this.role) {
    this.roles = [this.role];
  }
});

// Hash password before save
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

/** Get effective roles (handles legacy users with only role) */
userSchema.methods.getEffectiveRoles = function (): UserRole[] {
  const u = this as IUser;
  return u.roles?.length ? (u.roles as UserRole[]) : [u.role];
};

// Compare password method
userSchema.methods.correctPassword = async function (
  candidate: string,
  userPassword: string
): Promise<boolean> {
  return bcrypt.compare(candidate, userPassword);
};

userSchema.index({ deletionScheduledFor: 1 });

export const User: Model<IUser> = mongoose.model<IUser>('User', userSchema);
