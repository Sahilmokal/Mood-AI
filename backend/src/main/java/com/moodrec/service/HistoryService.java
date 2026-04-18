package com.moodrec.service;

import com.moodrec.dto.response.UserHistoryResponse;
import com.moodrec.model.MoodHistory;
import com.moodrec.model.User;
import com.moodrec.repository.MoodHistoryRepository;
import com.moodrec.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HistoryService {

    private final MoodHistoryRepository moodHistoryRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public UserHistoryResponse getUserHistory(String email, int page, int size) {
        User user = userRepository.findByEmail(email).orElseThrow();

        Page<MoodHistory> historyPage = moodHistoryRepository
                .findByUserIdOrderByCreatedAtDesc(user.getId(), PageRequest.of(page, size));

        List<Object[]> moodCountsRaw = moodHistoryRepository.countByMoodForUser(user.getId());
        Map<String, Long> moodCounts = moodCountsRaw.stream()
                .collect(Collectors.toMap(row -> (String) row[0], row -> (Long) row[1]));

        List<UserHistoryResponse.MoodEntry> entries = historyPage.getContent().stream()
                .map(h -> UserHistoryResponse.MoodEntry.builder()
                        .id(h.getId())
                        .mood(h.getMood())
                        .confidence(h.getConfidence())
                        .source(h.getSource().name())
                        .createdAt(h.getCreatedAt())
                        .build())
                .collect(Collectors.toList());

        return UserHistoryResponse.builder()
                .moodHistory(entries)
                .moodCounts(moodCounts)
                .totalSessions(historyPage.getTotalElements())
                .page(page)
                .size(size)
                .totalElements(historyPage.getTotalElements())
                .build();
    }
}
