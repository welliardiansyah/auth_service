export default {
  token: {
    invalid_token: {
      code: 'INVALID_TOKEN',
      message: 'Kode Token yang Anda masukan tidak valid.',
    },
    expired_token: {
      code: 'EXPIRED_TOKEN',
      message: 'Kode Token yang Anda masukan kadaluarsa.',
    },
    forbidden: {
      code: 'FORBIDDEN',
      message: 'Access Forbidden.',
    },
  },
  general: {
    success: 'SUCCESS',
    createSuccess: {
      code: 'CREATE_DATA_SUCCESS',
      message: 'Sukses tambah data.',
    },
    updateSuccess: {
      code: 'UPDATE_DATA_SUCCESS',
      message: 'Sukses ubah data.',
    },
    deleteSuccess: {
      code: 'DELETE_DATA_SUCCESS',
      message: 'Sukses hapus data.',
    },
    createFail: {
      code: 'CREATE_DATA_FAILED',
      message: 'Gagal tambah data.',
    },
    updateFail: {
      code: 'UPDATE_DATA_FAILED',
      message: 'Gagal ubah data.',
    },
    deleteFail: {
      code: 'DELETE_DATA_FAILED',
      message: 'Gagal hapus data.',
    },
    dataNotFound: {
      code: 'DATA_NOT_FOUND',
      message: 'Data tidak ditemukan.',
    },
  },
  create: {
    success: 'Create Otp Success.',
    fail: {
      code: 'CREATE_OTP_FAILED',
      message: 'Create OTP Gagal',
    },
    exist: {
      code: 'PHONE_ALREADY_REGISTERED',
      message: 'Nomor handphone kamu sudah terdaftar. Masuk ke aplikasi?',
    },
    invalid: 'Nomor telepon yang anda masukan tidak valid',
    invalidPhone: {
      code: 'PHONE_INVALID',
      message: 'Nomor telepon yang anda masukan tidak valid',
    },
    invalidValidated: {
      code: 'VALIDATE_INVALID',
      message: 'Validasi tidak sesuai, silahkan ulangi',
    },
    invalid_referral: 'Kode referral yang anda masukan tidak valid',
    waitexp: {
      code: 'OTP_WAITING_RESEND',
      message: 'Mohon tunggu beberapa saat untuk mengirim ulang kode OTP',
    },
  },
  login: {
    invalid_token: {
      code: 'INVALID_TOKEN',
      message: 'Kode Token yang Anda masukan tidak valid.',
    },
  },
  validate: {
    success: 'Validasi Otp Success.',
    invalid: 'Data Request tidak valid.',
    invalid_otp: {
      code: 'INVALID_OTP',
      message: 'Kode OTP yang Anda masukan tidak valid.',
    },
    invalid_email: {
      code: 'INVALID_EMAIL',
      message: 'Email yang Anda masukan tidak valid.',
    },
    invalid_phone: {
      code: 'INVALID_PHONE',
      message: 'Nomor handphone yang Anda masukan tidak valid.',
    },
    validated: 'Kode OTP sudah tervalidasi.',
  },
  profile: {
    success: 'Update Profile Success.',
    invalid_token: 'Kode Token yang Anda masukan tidak valid.',
    invalid_jwttoken: 'JWT Token tidak valid.',
    unauthorize: 'Token Tidak dikenal.',
  },
  refresh_token: {
    success: 'Refresh Token Success.',
    fail: 'Refresh Token Gagal.',
    invalid_refreshtoken: 'Kode Refresh Token yang Anda masukan tidak valid.',
  },
  reset_password: {
    success: 'Reset Password successful.',
    fail: 'Reset Password Gagal.',
    invalid_token: 'Kode Token yang Anda masukan tidak valid.',
  },
  validate_token: {
    success: 'Validasi Token successful.',
    invalid_token: 'Kode Token yang Anda masukan tidak valid.',
  },
};
