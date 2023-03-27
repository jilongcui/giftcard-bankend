import { SharedModule } from '@app/shared';
import { Test, TestingModule } from '@nestjs/testing';
import { Fund33Service } from './fund33.service';

describe('Fund33Service', () => {
  let fund33Service: Fund33Service;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [SharedModule],
      providers: [Fund33Service],
    }).compile();

    fund33Service = module.get<Fund33Service>(Fund33Service);
  });

  it('should be defined', () => {
    expect(fund33Service).toBeDefined();
  });

  it('mock', () => {
    let mockFn = jest.fn();
    let result = mockFn(1, 2, 3);

    // 断言mockFn的执行后返回undefined
    expect(result).toBeUndefined();
    // 断言mockFn被调用
    expect(mockFn).toBeCalled();
    // 断言mockFn被调用了一次
    expect(mockFn).toBeCalledTimes(1);
    // 断言mockFn传入的参数为1, 2, 3
    expect(mockFn).toHaveBeenCalledWith(1, 2, 3);
  })

  // it('login', () => {

  // })

  // it('should return an array of cats', async () => {
  //   const result = ['test'];
  //   jest.spyOn(fund33Service, 'findAll').mockImplementation(() => result);

  //   expect(await fund33Service.findAll()).toBe(result);
  // });
    
});
