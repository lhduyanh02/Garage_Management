package com.lhduyanh.garagemanagement.service;

import com.lhduyanh.garagemanagement.dto.AccountCreationRequest;
import com.lhduyanh.garagemanagement.entity.Account;
import com.lhduyanh.garagemanagement.exception.AppException;
import com.lhduyanh.garagemanagement.exception.ErrorCode;
import com.lhduyanh.garagemanagement.repository.AccountRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class AccountService {
    @Autowired
    private AccountRepository accountRepository;
/*
    public Account createAccount(AccountCreationRequest request){
        Account account = new Account();

        if(accountRepository.existsByEmail(request.getEmail())){
            throw new AppException(ErrorCode.USER_EXISTED);
        }

        account.setEmail(request.getEmail());
        account.setPassword(request.getPassword());
        account.setHo(request.getHo());
        account.setTen(request.getTen());
        account.setNgaysinh(request.getNgaysinh());
        account.setSdt(request.getSdt());

        return accountRepository.save(account);
    }

    public List<Account> getAllAccounts(){
        return accountRepository.findAll();
    }

    public Account getAccountById(String id){
        Optional<Account> acc = accountRepository.findById(id);
        if(acc.isPresent()){
            return acc.get();
        }
        else {
            throw new AppException(ErrorCode.ACCOUNT_NOT_EXISTED);
        }
    }

    public boolean updateStatusByEmail(String email, int status){
        int result = accountRepository.updateStatusByEmail(email, status);
        return result > 0;
    }

    public int deleteAccountById(String id){
        Optional<Account> acc = accountRepository.findById(id);
        if(acc.isPresent()){
            accountRepository.deleteById(id);
            return 1;
        }
        else {
            return -1;
        }
    }

 */
}
