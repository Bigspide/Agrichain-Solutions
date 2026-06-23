import { renderHook, act } from '@testing-library/react-hooks';
import { useI18n } from './useI18n';
import { useRouter } from 'next/router';

jest.mock('next/router', () => ({
  useRouter: jest.fn()
}));

const mockRouter = {
  locale: 'en',
  locales: ['en', 'fr'],
  pathname: '/',
  asPath: '/',
  query: {},
  push: jest.fn()
};

declare const mockedUseRouter: jest.Mock<any, any>;
(mockedUseRouter as any) = useRouter;

describe('useI18n hook', () => {
  beforeEach(() => {
    mockedUseRouter.mockReturnValue(mockRouter);
    jest.clearAllMocks();
  });

  it('returns current locale and locales list', () => {
    const { result } = renderHook(() => useI18n());
    expect(result.current.locale).toBe('en');
    expect(result.current.locales).toEqual(['en', 'fr']);
  });

  it('calls router.push when changing locale', () => {
    const { result } = renderHook(() => useI18n());
    act(() => {
      result.current.changeLanguage('fr');
    });
    expect(mockRouter.push).toHaveBeenCalledWith(
      { pathname: '/', query: {} },
      '/',
      { locale: 'fr' }
    );
  });

  it('does not push when new locale same as current', () => {
    const { result } = renderHook(() => useI18n());
    act(() => {
      result.current.changeLanguage('en');
    });
    expect(mockRouter.push).not.toHaveBeenCalled();
  });
});
