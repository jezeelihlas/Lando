export interface OtpProvider {
  sendOtp(email: string): Promise<void>;
  // Returns true only if the code is valid and unexpired for this email.
  verifyOtp(email: string, code: string): Promise<boolean>;
}
