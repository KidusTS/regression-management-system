package com.regression.security;

/**
 * Authorization rules used with {@code @PreAuthorize}. Reads need only a valid login.
 * <ul>
 *   <li>{@link #CAN_WRITE}: everyone except {@code VIEWER}</li>
 *   <li>{@link #CAN_MANAGE}: destructive / administrative actions (ADMIN, QA_LEAD)</li>
 * </ul>
 */
public final class Access {

    public static final String CAN_WRITE = "hasAnyRole('ADMIN','QA_LEAD','QA_ENGINEER')";
    public static final String CAN_MANAGE = "hasAnyRole('ADMIN','QA_LEAD')";

    private Access() {}
}
