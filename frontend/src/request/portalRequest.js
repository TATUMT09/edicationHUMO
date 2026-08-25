import portalAxios from './portalAxios';
import portalErrorHandler from './portalErrorHandler';
import successHandler from './successHandler';

const portalRequest = {
  register: async ({ firstName, lastName, dateOfBirth, email, password, purpose }) => {
    try {
      const response = await portalAxios.post('register', {
        firstName,
        lastName,
        dateOfBirth,
        email,
        password,
        purpose,
      });
      successHandler(response, { notifyOnSuccess: true, notifyOnFailed: true });
      return response.data;
    } catch (error) {
      return portalErrorHandler(error);
    }
  },
  verifyCode: async ({ email, code }) => {
    try {
      const response = await portalAxios.post('verify-code', { email, code });
      successHandler(response, { notifyOnSuccess: true, notifyOnFailed: true });
      return response.data;
    } catch (error) {
      return portalErrorHandler(error);
    }
  },
  resendCode: async ({ email }) => {
    try {
      const response = await portalAxios.post('resend-code', { email });
      successHandler(response, { notifyOnSuccess: true, notifyOnFailed: true });
      return response.data;
    } catch (error) {
      return portalErrorHandler(error);
    }
  },
  login: async ({ email, password }) => {
    try {
      const response = await portalAxios.post('login', { email, password });
      successHandler(response, { notifyOnSuccess: false, notifyOnFailed: true });
      return response.data;
    } catch (error) {
      return portalErrorHandler(error);
    }
  },
  forgetPassword: async ({ email }) => {
    try {
      const response = await portalAxios.post('forgetpassword', { email });
      successHandler(response, { notifyOnSuccess: true, notifyOnFailed: true });
      return response.data;
    } catch (error) {
      return portalErrorHandler(error);
    }
  },
  verifyResetCode: async ({ email, code }) => {
    try {
      const response = await portalAxios.post('verify-reset-code', { email, code });
      successHandler(response, { notifyOnSuccess: false, notifyOnFailed: true });
      return response.data;
    } catch (error) {
      return portalErrorHandler(error);
    }
  },
  resetPassword: async ({ email, resetToken, password }) => {
    try {
      const response = await portalAxios.post('resetpassword', { email, resetToken, password });
      successHandler(response, { notifyOnSuccess: true, notifyOnFailed: true });
      return response.data;
    } catch (error) {
      return portalErrorHandler(error);
    }
  },
  logout: async () => {
    try {
      const response = await portalAxios.post('logout');
      return response.data;
    } catch (error) {
      return portalErrorHandler(error);
    }
  },

  getSubjects: async () => {
    try {
      const response = await portalAxios.get('subjects');
      return response.data;
    } catch (error) {
      return portalErrorHandler(error);
    }
  },
  getContent: async (subjectId, { level, type } = {}) => {
    try {
      const params = {};
      if (level) params.level = level;
      if (type) params.type = type;
      const response = await portalAxios.get(`subjects/${subjectId}/content`, { params });
      return response.data;
    } catch (error) {
      return portalErrorHandler(error);
    }
  },
  getVideo: async (videoId) => {
    try {
      const response = await portalAxios.get(`videos/${videoId}`);
      return response.data;
    } catch (error) {
      return portalErrorHandler(error);
    }
  },
  getBook: async (bookId) => {
    try {
      const response = await portalAxios.get(`books/${bookId}`);
      return response.data;
    } catch (error) {
      return portalErrorHandler(error);
    }
  },
  getTestMeta: async (testId) => {
    try {
      const response = await portalAxios.get(`tests/${testId}/meta`);
      return response.data;
    } catch (error) {
      return portalErrorHandler(error);
    }
  },
  getTestToTake: async (testId, count) => {
    try {
      const response = await portalAxios.get(`tests/${testId}/take`, { params: { count } });
      return response.data;
    } catch (error) {
      return portalErrorHandler(error);
    }
  },
  checkAnswer: async (testId, { questionId, selectedOptionIds, sessionToken }) => {
    try {
      const response = await portalAxios.post(`tests/${testId}/check-answer`, {
        questionId,
        selectedOptionIds,
        sessionToken,
      });
      return response.data;
    } catch (error) {
      return portalErrorHandler(error);
    }
  },
  submitAttempt: async (testId, answers, sessionToken) => {
    try {
      const response = await portalAxios.post(`tests/${testId}/attempts`, {
        answers,
        sessionToken,
      });
      successHandler(response, { notifyOnSuccess: false, notifyOnFailed: true });
      return response.data;
    } catch (error) {
      return portalErrorHandler(error);
    }
  },
  getMyAttempts: async () => {
    try {
      const response = await portalAxios.get('attempts');
      return response.data;
    } catch (error) {
      return portalErrorHandler(error);
    }
  },
  getAttempt: async (attemptId) => {
    try {
      const response = await portalAxios.get(`attempts/${attemptId}`);
      return response.data;
    } catch (error) {
      return portalErrorHandler(error);
    }
  },
  getStatsSummary: async () => {
    try {
      const response = await portalAxios.get('stats/summary');
      return response.data;
    } catch (error) {
      return portalErrorHandler(error);
    }
  },
  getLeaderboard: async (period = 'overall') => {
    try {
      const response = await portalAxios.get('leaderboard', { params: { period } });
      return response.data;
    } catch (error) {
      return portalErrorHandler(error);
    }
  },
  getStarsHistory: async () => {
    try {
      const response = await portalAxios.get('stars/history');
      return response.data;
    } catch (error) {
      return portalErrorHandler(error);
    }
  },
  getRewards: async () => {
    try {
      const response = await portalAxios.get('rewards');
      return response.data;
    } catch (error) {
      return portalErrorHandler(error);
    }
  },
  purchaseReward: async (rewardId) => {
    try {
      const response = await portalAxios.post(`rewards/${rewardId}/purchase`);
      successHandler(response, { notifyOnSuccess: true, notifyOnFailed: true });
      return response.data;
    } catch (error) {
      return portalErrorHandler(error);
    }
  },
  getMyRewardOrders: async () => {
    try {
      const response = await portalAxios.get('reward-orders');
      return response.data;
    } catch (error) {
      return portalErrorHandler(error);
    }
  },
  search: async (q) => {
    try {
      const response = await portalAxios.get('search', { params: { q } });
      return response.data;
    } catch (error) {
      return portalErrorHandler(error);
    }
  },
  getMistakes: async () => {
    try {
      const response = await portalAxios.get('mistakes');
      return response.data;
    } catch (error) {
      return portalErrorHandler(error);
    }
  },
  getLibrary: async ({ subjectId, level, q, category } = {}) => {
    try {
      const params = {};
      if (subjectId) params.subjectId = subjectId;
      if (level) params.level = level;
      if (q) params.q = q;
      if (category) params.category = category;
      const response = await portalAxios.get('library', { params });
      return response.data;
    } catch (error) {
      return portalErrorHandler(error);
    }
  },
};

export default portalRequest;
